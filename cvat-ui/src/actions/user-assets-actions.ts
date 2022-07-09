// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { ActionCreator, AnyAction, Dispatch } from 'redux';
import getCore from 'cvat-core-wrapper';
import { ThunkAction } from 'redux-thunk';

export enum UserAssetsActions {
    GET_OWNED_POINTS = 'GET_OWNED_POINTS',
    GET_OWNED_POINTS_SUCCESS = 'GET_OWNED_POINTS_SUCCESS',
    GET_OWNED_POINTS_FAILED = 'GET_OWNED_POINTS_FAILED',
    PURCHASE_DATASET = 'PURCHASE_DATASET', // reserved
    PURCHASE_DATASET_SUCCESS = 'PURCHASE_DATASET_SUCCESS', // reserved
    PURCHASE_DATASET_FAILED = 'PURCHASE_DATASET_FAILED', // reserved
}

const cvat = getCore();

export function getOwnedPoints(): AnyAction {
    return {
        type: UserAssetsActions.GET_OWNED_POINTS,
        payload: { },
    };
}

export function getOwnedPointsSuccess(ownedPoints: number): AnyAction {
    return {
        type: UserAssetsActions.GET_OWNED_POINTS_SUCCESS,
        payload: { ownedPoints },
    };
}

export function getOwnedPointsFailed(error: any): AnyAction {
    return {
        type: UserAssetsActions.GET_OWNED_POINTS_FAILED,
        payload: { error },
    };
}

export function getOwnedPointsAsync(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(getOwnedPoints());
        let result = null;
        try {
            result = await cvat.users.getOwnedPoints();
        } catch (error) {
            dispatch(getOwnedPointsFailed(error));
            return;
        }
        dispatch(getOwnedPointsSuccess(result));
    };
}
