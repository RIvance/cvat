// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import { TasksQuery, CombinedState, ActiveInference } from 'reducers/interfaces';

import { getPurchasedListAsync, getTasksAsync, purchaseDatasetAsync } from 'actions/tasks-actions';
import { cancelInferenceAsync } from 'actions/models-actions';
import DatasetItemComponent from 'components/datasets-page/dataset-item';
import { exportActions } from '../../actions/export-actions';

interface StateToProps {
    deleted: boolean;
    hidden: boolean;
    previewImage: string;
    taskInstance: any;
    activeInference: ActiveInference | null;
    purchasedList: number[];
}

interface DispatchToProps {
    getTasks(query: TasksQuery): void;
    purchaseDataset(taskID: number): void;
    exportDataset(taskInstance: any): void;
    cancelAutoAnnotation(): void;
}

interface OwnProps {
    idx: number;
    taskID: number;
}

function mapStateToProps(state: CombinedState, own: OwnProps): StateToProps {
    const task = state.tasks.current[own.idx];
    const { deletes } = state.tasks.activities;
    const id = own.taskID;

    return {
        hidden: state.tasks.hideEmpty && task.instance.jobs.length === 0,
        deleted: id in deletes ? deletes[id] === true : false,
        previewImage: task.preview,
        taskInstance: task.instance,
        activeInference: state.models.inferences[id] || null,
        purchasedList: state.tasks.purchasedList,
    };
}

function mapDispatchToProps(dispatch: any, own: OwnProps): DispatchToProps {
    return {
        getTasks(query: TasksQuery): void {
            dispatch(getPurchasedListAsync());
            dispatch(getTasksAsync(query));
        },
        exportDataset(taskInstance: any) {
            dispatch(exportActions.openExportModal(taskInstance));
        },
        purchaseDataset(taskID: number) {
            dispatch(purchaseDatasetAsync(taskID));
        },
        cancelAutoAnnotation(): void {
            dispatch(cancelInferenceAsync(own.taskID));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DatasetItemComponent);
