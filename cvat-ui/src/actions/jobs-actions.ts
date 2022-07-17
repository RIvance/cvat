// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { ActionUnion, createAction, ThunkAction } from 'utils/redux';
import getCore from 'cvat-core-wrapper';
import { Indexable, JobsQuery } from 'reducers/interfaces';
import { string } from 'prop-types';
import { saveAnnotationsAsync } from './annotation-actions';
import { updateJobAsync } from './tasks-actions';

const cvat = getCore();

export enum JobsActionTypes {
    GET_JOBS = 'GET_JOBS',
    GET_JOBS_SUCCESS = 'GET_JOBS_SUCCESS',
    GET_JOBS_FAILED = 'GET_JOBS_FAILED',
    CHECK_JOB_REVIEWABLE_FORBIDDEN = 'CHECK_JOB_REVIEWABLE_FORBIDDEN',
    CHECK_JOB_REVIEWABLE_FAILED = 'CHECK_JOB_REVIEWABLE_FAILED',
    SUBMIT_JOB_REVIEW = 'SUBMIT_JOB_REVIEW',
    SUBMIT_JOB_REVIEW_SUCCESS = 'SUBMIT_JOB_REVIEW_SUCCESS',
    SUBMIT_JOB_REVIEW_FAILED = 'SUBMIT_JOB_REVIEW_FAILED',
    SUBMIT_JOB = 'SUBMIT_JOB',
    SUBMIT_JOB_SUCCESS = 'SUBMIT_JOB_SUCCESS',
    SUBMIT_JOB_FAILED = 'SUBMIT_JOB_FAILED',
}

interface JobsList extends Array<any> {
    count: number;
}

const jobsActions = {
    getJobs: (query: Partial<JobsQuery>) => createAction(JobsActionTypes.GET_JOBS, { query }),
    getJobsSuccess: (jobs: JobsList, previews: string[]) => (
        createAction(JobsActionTypes.GET_JOBS_SUCCESS, { jobs, previews })
    ),
    getJobsFailed: (error: any) => createAction(JobsActionTypes.GET_JOBS_FAILED, { error }),
    checkReviewableForbidden: (reason: any) => createAction(JobsActionTypes.CHECK_JOB_REVIEWABLE_FORBIDDEN, { reason }),
    checkReviewableFailed: (error: any) => createAction(JobsActionTypes.CHECK_JOB_REVIEWABLE_FAILED, { error }),
    submitJobReview: (reviewResult: boolean) => createAction(JobsActionTypes.SUBMIT_JOB_REVIEW, { reviewResult }),
    submitJobReviewSuccess: () => createAction(JobsActionTypes.SUBMIT_JOB_REVIEW_SUCCESS),
    submitJobReviewFailed: (error: any) => createAction(JobsActionTypes.SUBMIT_JOB_REVIEW_FAILED, { error }),
    submitJob: () => createAction(JobsActionTypes.SUBMIT_JOB),
    submitJobSuccess: () => createAction(JobsActionTypes.SUBMIT_JOB_SUCCESS),
    submitJobFailed: (error: any) => createAction(JobsActionTypes.SUBMIT_JOB_FAILED, { error }),
};

export type JobsActions = ActionUnion<typeof jobsActions>;

export const checkIfReviewableAsync = (jobInstance: any, ifReviewable: () => void): ThunkAction => async (dispatch) => {
    try {
        const result = await cvat.jobs.reviewable(jobInstance.id);
        if (result.success || (result.data && result.data.success)) {
            ifReviewable();
        } else if (result.data && result.data instanceof string) {
            dispatch(jobsActions.checkReviewableForbidden(result.data));
        } else {
            dispatch(jobsActions.checkReviewableForbidden(result));
        }
    } catch (error) {
        dispatch(jobsActions.checkReviewableFailed(error));
    }
};

export const getJobsAsync = (query: JobsQuery): ThunkAction => async (dispatch) => {
    try {
        // We remove all keys with null values from the query
        const filteredQuery = { ...query };
        for (const key of Object.keys(query)) {
            if ((filteredQuery as Indexable)[key] === null) {
                delete (filteredQuery as Indexable)[key];
            }
        }

        dispatch(jobsActions.getJobs(filteredQuery));
        const jobs = await cvat.jobs.get(filteredQuery);
        const previewPromises = jobs.map((job: any) => (job as any).frames.preview().catch(() => ''));
        dispatch(jobsActions.getJobsSuccess(jobs, await Promise.all(previewPromises)));
    } catch (error) {
        dispatch(jobsActions.getJobsFailed(error));
    }
};

export const submitJobReviewAsync = (jobID: number, reviewResult: boolean, after: () => void):
    ThunkAction => async (dispatch) => {
    try {
        dispatch(jobsActions.submitJobReview(reviewResult));
        const result = await cvat.jobs.review(jobID, reviewResult);
        if (result.success || (result.data && result.data.success)) {
            dispatch(jobsActions.submitJobReviewSuccess());
            after();
        } else if (result.data && result.data instanceof string) {
            dispatch(jobsActions.checkReviewableForbidden(result.data));
        } else {
            dispatch(jobsActions.checkReviewableForbidden(result));
        }
    } catch (error) {
        dispatch(jobsActions.submitJobReviewFailed(error));
    }
};

export const submitJobAsync = (sessionInstance: any, after: () => void): ThunkAction => async (dispatch) => {
    try {
        if (sessionInstance instanceof cvat.classes.Job) {
            await dispatch(updateJobAsync(sessionInstance));
            dispatch(jobsActions.submitJob());
            dispatch(saveAnnotationsAsync(sessionInstance, async () => {
                const result = await cvat.jobs.submit(sessionInstance.id);
                if (result.success || (result.data && result.data.success)) {
                    dispatch(jobsActions.submitJobSuccess());
                    after();
                } else if (result.data && result.data instanceof string) {
                    dispatch(jobsActions.checkReviewableForbidden(result.data));
                } else {
                    dispatch(jobsActions.checkReviewableForbidden(result));
                }
            }));
        }
    } catch (error) {
        dispatch(jobsActions.submitJobFailed(error));
    }
};
