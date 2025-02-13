// Copyright (C) 2019-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { ActionCreator, AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { CombinedState, Indexable, TasksQuery } from 'reducers/interfaces';
import { getCVATStore } from 'cvat-store';
import getCore from 'cvat-core-wrapper';
import { string } from 'prop-types';
import { getInferenceStatusAsync } from './models-actions';

const cvat = getCore();

export enum TasksActionTypes {
    GET_TASKS = 'GET_TASKS',
    GET_TASKS_SUCCESS = 'GET_TASKS_SUCCESS',
    GET_TASKS_FAILED = 'GET_TASKS_FAILED',
    LOAD_ANNOTATIONS = 'LOAD_ANNOTATIONS',
    LOAD_ANNOTATIONS_SUCCESS = 'LOAD_ANNOTATIONS_SUCCESS',
    LOAD_ANNOTATIONS_FAILED = 'LOAD_ANNOTATIONS_FAILED',
    DELETE_TASK = 'DELETE_TASK',
    DELETE_TASK_SUCCESS = 'DELETE_TASK_SUCCESS',
    DELETE_TASK_FAILED = 'DELETE_TASK_FAILED',
    CREATE_TASK = 'CREATE_TASK',
    CREATE_TASK_STATUS_UPDATED = 'CREATE_TASK_STATUS_UPDATED',
    CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS',
    CREATE_TASK_FAILED = 'CREATE_TASK_FAILED',
    UPDATE_TASK = 'UPDATE_TASK',
    UPDATE_TASK_SUCCESS = 'UPDATE_TASK_SUCCESS',
    UPDATE_TASK_FAILED = 'UPDATE_TASK_FAILED',
    UPDATE_JOB = 'UPDATE_JOB',
    UPDATE_JOB_SUCCESS = 'UPDATE_JOB_SUCCESS',
    UPDATE_JOB_FAILED = 'UPDATE_JOB_FAILED',
    CLAIM_JOB = 'CLAIM_JOB',
    CLAIM_JOB_SUCCESS = 'CLAIM_JOB_SUCCESS',
    CLAIM_JOB_FAILED = 'CLAIM_JOB_FAILED',
    HIDE_EMPTY_TASKS = 'HIDE_EMPTY_TASKS',
    EXPORT_TASK = 'EXPORT_TASK',
    EXPORT_TASK_SUCCESS = 'EXPORT_TASK_SUCCESS',
    EXPORT_TASK_FAILED = 'EXPORT_TASK_FAILED',
    IMPORT_TASK = 'IMPORT_TASK',
    IMPORT_TASK_SUCCESS = 'IMPORT_TASK_SUCCESS',
    IMPORT_TASK_FAILED = 'IMPORT_TASK_FAILED',
    SWITCH_MOVE_TASK_MODAL_VISIBLE = 'SWITCH_MOVE_TASK_MODAL_VISIBLE',
    PURCHASE_DATASET = 'PURCHASE_DATASET',
    PURCHASE_DATASET_SUCCESS = 'PURCHASE_DATASET_SUCCESS',
    PURCHASE_DATASET_FAILED = 'PURCHASE_DATASET_FAILED',
    GET_PURCHASED_LIST = 'GET_PURCHASED_LIST',
    GET_PURCHASED_LIST_SUCCESS = 'GET_PURCHASED_LIST_SUCCESS',
    GET_PURCHASED_LIST_FAILED = 'GET_PURCHASED_LIST_FAILED',
}

function getTasks(query: TasksQuery, updateQuery: boolean): AnyAction {
    const action = {
        type: TasksActionTypes.GET_TASKS,
        payload: {
            updateQuery,
            query,
        },
    };

    return action;
}

export function getTasksSuccess(array: any[], previews: string[], count: number): AnyAction {
    const action = {
        type: TasksActionTypes.GET_TASKS_SUCCESS,
        payload: {
            previews,
            array,
            count,
        },
    };

    return action;
}

function getTasksFailed(error: any): AnyAction {
    const action = {
        type: TasksActionTypes.GET_TASKS_FAILED,
        payload: { error },
    };

    return action;
}

export function getTasksAsync(query: TasksQuery, updateQuery = true): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(getTasks(query, updateQuery));

        // We remove all keys with null values from the query
        const filteredQuery = { ...query };
        for (const key of Object.keys(query)) {
            if ((filteredQuery as Indexable)[key] === null) {
                delete (filteredQuery as Indexable)[key];
            }
        }

        let result = null;
        try {
            result = await cvat.tasks.get(filteredQuery);
        } catch (error) {
            dispatch(getTasksFailed(error));
            return;
        }

        const array = Array.from(result);
        const promises = array.map((task): string => (task as any).frames.preview().catch(() => ''));

        dispatch(getInferenceStatusAsync());
        dispatch(getTasksSuccess(array, await Promise.all(promises), result.count));
    };
}

function loadAnnotations(task: any, loader: any): AnyAction {
    const action = {
        type: TasksActionTypes.LOAD_ANNOTATIONS,
        payload: {
            task,
            loader,
        },
    };

    return action;
}

function loadAnnotationsSuccess(task: any): AnyAction {
    const action = {
        type: TasksActionTypes.LOAD_ANNOTATIONS_SUCCESS,
        payload: {
            task,
        },
    };

    return action;
}

function loadAnnotationsFailed(task: any, error: any): AnyAction {
    const action = {
        type: TasksActionTypes.LOAD_ANNOTATIONS_FAILED,
        payload: {
            task,
            error,
        },
    };

    return action;
}

export function loadAnnotationsAsync(
    task: any,
    loader: any,
    file: File,
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            const store = getCVATStore();
            const state: CombinedState = store.getState();
            if (state.tasks.activities.loads[task.id]) {
                throw Error('Only one loading of annotations for a task allowed at the same time');
            }
            dispatch(loadAnnotations(task, loader));
            await task.annotations.upload(file, loader);
        } catch (error) {
            dispatch(loadAnnotationsFailed(task, error));
            return;
        }

        dispatch(loadAnnotationsSuccess(task));
    };
}

function importTask(): AnyAction {
    const action = {
        type: TasksActionTypes.IMPORT_TASK,
        payload: {},
    };

    return action;
}

function importTaskSuccess(task: any): AnyAction {
    const action = {
        type: TasksActionTypes.IMPORT_TASK_SUCCESS,
        payload: {
            task,
        },
    };

    return action;
}

function importTaskFailed(error: any): AnyAction {
    const action = {
        type: TasksActionTypes.IMPORT_TASK_FAILED,
        payload: {
            error,
        },
    };

    return action;
}

export function importTaskAsync(file: File): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(importTask());
            const taskInstance = await cvat.classes.Task.import(file);
            dispatch(importTaskSuccess(taskInstance));
        } catch (error) {
            dispatch(importTaskFailed(error));
        }
    };
}

function exportTask(taskID: number): AnyAction {
    const action = {
        type: TasksActionTypes.EXPORT_TASK,
        payload: {
            taskID,
        },
    };

    return action;
}

function exportTaskSuccess(taskID: number): AnyAction {
    const action = {
        type: TasksActionTypes.EXPORT_TASK_SUCCESS,
        payload: {
            taskID,
        },
    };

    return action;
}

function exportTaskFailed(taskID: number, error: Error): AnyAction {
    const action = {
        type: TasksActionTypes.EXPORT_TASK_FAILED,
        payload: {
            taskID,
            error,
        },
    };

    return action;
}

export function exportTaskAsync(taskInstance: any): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(exportTask(taskInstance.id));

        try {
            const url = await taskInstance.export();
            const downloadAnchor = window.document.getElementById('downloadAnchor') as HTMLAnchorElement;
            downloadAnchor.href = url;
            downloadAnchor.click();
            dispatch(exportTaskSuccess(taskInstance.id));
        } catch (error) {
            dispatch(exportTaskFailed(taskInstance.id, error as Error));
        }
    };
}

function deleteTask(taskID: number): AnyAction {
    const action = {
        type: TasksActionTypes.DELETE_TASK,
        payload: {
            taskID,
        },
    };

    return action;
}

function deleteTaskSuccess(taskID: number): AnyAction {
    const action = {
        type: TasksActionTypes.DELETE_TASK_SUCCESS,
        payload: {
            taskID,
        },
    };

    return action;
}

function deleteTaskFailed(taskID: number, error: any): AnyAction {
    const action = {
        type: TasksActionTypes.DELETE_TASK_FAILED,
        payload: {
            taskID,
            error,
        },
    };

    return action;
}

export function deleteTaskAsync(taskInstance: any): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(deleteTask(taskInstance.id));
            await taskInstance.delete();
        } catch (error) {
            dispatch(deleteTaskFailed(taskInstance.id, error));
            return;
        }

        dispatch(deleteTaskSuccess(taskInstance.id));
    };
}

function createTask(): AnyAction {
    const action = {
        type: TasksActionTypes.CREATE_TASK,
        payload: {},
    };

    return action;
}

function createTaskSuccess(taskId: number): AnyAction {
    const action = {
        type: TasksActionTypes.CREATE_TASK_SUCCESS,
        payload: {
            taskId,
        },
    };

    return action;
}

function createTaskFailed(error: any): AnyAction {
    const action = {
        type: TasksActionTypes.CREATE_TASK_FAILED,
        payload: {
            error,
        },
    };

    return action;
}

function createTaskUpdateStatus(status: string): AnyAction {
    const action = {
        type: TasksActionTypes.CREATE_TASK_STATUS_UPDATED,
        payload: {
            status,
        },
    };

    return action;
}

export function createTaskAsync(data: any): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        const description: any = {
            name: data.basic.name,
            labels: data.labels,
            image_quality: 70,
            use_zip_chunks: data.advanced.useZipChunks,
            use_cache: data.advanced.useCache,
            sorting_method: data.advanced.sortingMethod,
        };

        if (data.projectId) {
            description.project_id = data.projectId;
        }
        if (data.advanced.bugTracker) {
            description.bug_tracker = data.advanced.bugTracker;
        }
        if (data.advanced.segmentSize) {
            description.segment_size = data.advanced.segmentSize;
        }
        if (data.advanced.overlapSize) {
            description.overlap = data.advanced.overlapSize;
        }
        if (data.advanced.startFrame) {
            description.start_frame = data.advanced.startFrame;
        }
        if (data.advanced.stopFrame) {
            description.stop_frame = data.advanced.stopFrame;
        }
        if (data.advanced.frameFilter) {
            description.frame_filter = data.advanced.frameFilter;
        }
        if (data.advanced.imageQuality) {
            description.image_quality = data.advanced.imageQuality;
        }
        if (data.advanced.dataChunkSize) {
            description.data_chunk_size = data.advanced.dataChunkSize;
        }
        if (data.advanced.copyData) {
            description.copy_data = data.advanced.copyData;
        }
        if (data.subset) {
            description.subset = data.subset;
        }
        if (data.cloudStorageId) {
            description.cloud_storage_id = data.cloudStorageId;
        }

        const taskInstance = new cvat.classes.Task(description);
        taskInstance.clientFiles = data.files.local;
        taskInstance.serverFiles = data.files.share.concat(data.files.cloudStorage);
        taskInstance.remoteFiles = data.files.remote;

        if (data.advanced.repository) {
            const [gitPlugin] = (await cvat.plugins.list()).filter((plugin: any): boolean => plugin.name === 'Git');

            if (gitPlugin) {
                gitPlugin.callbacks.onStatusChange = (status: string): void => {
                    dispatch(createTaskUpdateStatus(status));
                };
                gitPlugin.data.task = taskInstance;
                gitPlugin.data.repos = data.advanced.repository;
                gitPlugin.data.format = data.advanced.format;
                gitPlugin.data.lfs = data.advanced.lfs;
            }
        }

        dispatch(createTask());
        try {
            const savedTask = await taskInstance.save((status: string, progress: number): void => {
                dispatch(createTaskUpdateStatus(status + (progress !== null ? ` ${Math.floor(progress * 100)}%` : '')));
            });
            dispatch(createTaskSuccess(savedTask.id));
        } catch (error) {
            dispatch(createTaskFailed(error));
        }
    };
}

function updateTask(): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_TASK,
        payload: {},
    };

    return action;
}

export function updateTaskSuccess(task: any, taskID: number): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_TASK_SUCCESS,
        payload: { task, taskID },
    };

    return action;
}

function updateJob(): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_JOB,
        payload: { },
    };

    return action;
}

function updateJobSuccess(jobInstance: any): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_JOB_SUCCESS,
        payload: { jobInstance },
    };

    return action;
}

function updateJobFailed(jobID: number, error: any): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_JOB_FAILED,
        payload: { jobID, error },
    };

    return action;
}

function updateTaskFailed(error: any, task: any): AnyAction {
    const action = {
        type: TasksActionTypes.UPDATE_TASK_FAILED,
        payload: { error, task },
    };

    return action;
}

export function updateTaskAsync(taskInstance: any): ThunkAction<Promise<void>, CombinedState, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(updateTask());
            const task = await taskInstance.save();
            dispatch(updateTaskSuccess(task, taskInstance.id));
        } catch (error) {
            // try abort all changes
            let task = null;
            try {
                [task] = await cvat.tasks.get({ id: taskInstance.id });
            } catch (fetchError) {
                dispatch(updateTaskFailed(error, taskInstance));
                return;
            }

            dispatch(updateTaskFailed(error, task));
        }
    };
}

// a job is a part of a task, so for simplify we consider
// updating the job as updating a task
export function updateJobAsync(jobInstance: any): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(updateJob());
            const newJob = await jobInstance.save();
            dispatch(updateJobSuccess(newJob));
        } catch (error) {
            dispatch(updateJobFailed(jobInstance.id, error));
        }
    };
}

function claimJob(): AnyAction {
    return {
        type: TasksActionTypes.CLAIM_JOB,
        payload: {},
    };
}

function claimJobSuccess(jobID: number): AnyAction {
    return {
        type: TasksActionTypes.CLAIM_JOB_SUCCESS,
        payload: { jobID },
    };
}

function claimJobFailed(error: any): AnyAction {
    return {
        type: TasksActionTypes.CLAIM_JOB_FAILED,
        payload: { error },
    };
}

export function claimJobAsync(jobInstance: any, after?: () => void): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(claimJob());
            const result = await cvat.jobs.claim(jobInstance.id);
            if (result.data.success) {
                dispatch(claimJobSuccess(jobInstance.id));
                if (after) {
                    after();
                }
            } else {
                dispatch(claimJobFailed(result.data));
            }
        } catch (error) {
            dispatch(claimJobFailed(error));
        }
    };
}

export function hideEmptyTasks(hideEmpty: boolean): AnyAction {
    const action = {
        type: TasksActionTypes.HIDE_EMPTY_TASKS,
        payload: {
            hideEmpty,
        },
    };

    return action;
}

export function switchMoveTaskModalVisible(visible: boolean, taskId: number | null = null): AnyAction {
    const action = {
        type: TasksActionTypes.SWITCH_MOVE_TASK_MODAL_VISIBLE,
        payload: {
            taskId,
            visible,
        },
    };

    return action;
}

interface LabelMap {
    label_id: number;
    new_label_name: string | null;
    clear_attributes: boolean;
}

export function moveTaskToProjectAsync(
    taskInstance: any,
    projectId: any,
    labelMap: LabelMap[],
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(updateTask());
        try {
            // eslint-disable-next-line no-param-reassign
            taskInstance.labels = labelMap.map((mapper) => {
                const [label] = taskInstance.labels.filter((_label: any) => mapper.label_id === _label.id);
                label.name = mapper.new_label_name;
                return label;
            });
            // eslint-disable-next-line no-param-reassign
            taskInstance.projectId = projectId;
            await taskInstance.save();
            const [task] = await cvat.tasks.get({ id: taskInstance.id });
            dispatch(updateTaskSuccess(task, task.id));
        } catch (error) {
            dispatch(updateTaskFailed(error, taskInstance));
        }
    };
}

function purchaseDataset(): AnyAction {
    return {
        type: TasksActionTypes.PURCHASE_DATASET,
    };
}

function purchaseDatasetSuccess(taskID: number): AnyAction {
    return {
        type: TasksActionTypes.PURCHASE_DATASET_SUCCESS,
        payload: { taskID },
    };
}

function purchaseDatasetFailed(error: any): AnyAction {
    return {
        type: TasksActionTypes.PURCHASE_DATASET_FAILED,
        payload: { error },
    };
}

export function purchaseDatasetAsync(taskID: number) : ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(purchaseDataset());
            const result = await cvat.server.request(`${cvat.config.backendAPI}/tasks/${taskID}/purchase`, {
                method: 'PUT',
            });
            if (result.success || (result.data && result.data.success)) {
                dispatch(purchaseDatasetSuccess(taskID));
            } else if (result.data && result.data instanceof string) {
                dispatch(purchaseDatasetFailed(result.data));
            } else {
                dispatch(purchaseDatasetFailed(result));
            }
        } catch (error) {
            dispatch(purchaseDatasetFailed(error));
        }
    };
}

function getPurchasedList(): AnyAction {
    return {
        type: TasksActionTypes.GET_PURCHASED_LIST,
    };
}

function getPurchasedListSuccess(purchasedList: number[]): AnyAction {
    return {
        type: TasksActionTypes.GET_PURCHASED_LIST_SUCCESS,
        payload: { purchasedList },
    };
}

function getPurchasedListFailed(error: any): AnyAction {
    return {
        type: TasksActionTypes.GET_PURCHASED_LIST_FAILED,
        payload: { error },
    };
}

export function getPurchasedListAsync() : ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        try {
            dispatch(getPurchasedList());
            const result = await cvat.server.request(`${cvat.config.backendAPI}/tasks/purchasedlist`, {
                method: 'GET',
            });
            if (result.length > 0 && typeof result[0] === 'number') {
                dispatch(getPurchasedListSuccess(result));
            } else {
                dispatch(getPurchasedListSuccess([]));
            }
        } catch (error) {
            dispatch(getPurchasedListFailed(error));
        }
    };
}
