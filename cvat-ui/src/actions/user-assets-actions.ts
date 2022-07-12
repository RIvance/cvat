// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { ActionCreator, AnyAction, Dispatch } from 'redux';
import getCore from 'cvat-core-wrapper';
import { ThunkAction } from 'redux-thunk';

export enum UserAssetsActions {
    GET_FUND = 'GET_FUND',
    GET_FUND_SUCCESS = 'GET_FUND_SUCCESS',
    GET_FUND_FAILED = 'GET_FUND_FAILED',
    PURCHASE_DATASET = 'PURCHASE_DATASET', // reserved
    PURCHASE_DATASET_SUCCESS = 'PURCHASE_DATASET_SUCCESS', // reserved
    PURCHASE_DATASET_FAILED = 'PURCHASE_DATASET_FAILED', // reserved
}

const cvat = getCore();

export function getFund(): AnyAction {
    return {
        type: UserAssetsActions.GET_FUND,
        payload: { },
    };
}

export function getFundSuccess(fund: number): AnyAction {
    return {
        type: UserAssetsActions.GET_FUND_SUCCESS,
        payload: { fund },
    };
}

export function getFundFailed(error: any): AnyAction {
    return {
        type: UserAssetsActions.GET_FUND_FAILED,
        payload: { error },
    };
}

export function getFundAsync(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(getFund());
        let result = null;
        try {
            result = await cvat.users.getFund();
        } catch (error) {
            dispatch(getFundFailed(error));
            return;
        }
        dispatch(getFundSuccess(result));
    };
}
