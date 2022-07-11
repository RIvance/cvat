// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { connect } from 'react-redux';

import JobListComponent from 'components/task-page/job-list';
import { claimJobAsync, updateJobAsync } from 'actions/tasks-actions';
import { Task } from 'reducers/interfaces';
import { checkIfReviewableAsync } from '../../actions/jobs-actions';

interface OwnProps {
    user: any;
    task: Task;
}

interface DispatchToProps {
    onCheckReviewable(jobInstance: any, ifReviewable: () => void): void;
    onClaimJob(jobInstance: any, afterClaim?: () => void): void;
    onJobUpdate(jobInstance: any): void;
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onCheckReviewable(jobInstance: any, ifReviewable: () => void): void {
            dispatch(checkIfReviewableAsync(jobInstance, ifReviewable));
        },
        onClaimJob(jobInstance: any, afterClaim?: () => void): void {
            dispatch(claimJobAsync(jobInstance, afterClaim));
        },
        onJobUpdate: (jobInstance: any): void => dispatch(updateJobAsync(jobInstance)),
    };
}

function TaskPageContainer(props: DispatchToProps & OwnProps): JSX.Element {
    const {
        user, task, onClaimJob, onCheckReviewable, onJobUpdate,
    } = props;

    return (
        <JobListComponent
            user={user}
            taskInstance={task.instance}
            onClaimJob={onClaimJob}
            onCheckReviewable={onCheckReviewable}
            onJobUpdate={onJobUpdate}
        />
    );
}

export default connect(null, mapDispatchToProps)(TaskPageContainer);
