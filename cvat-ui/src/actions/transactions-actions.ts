// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { ActionCreator, AnyAction, Dispatch } from 'redux';
import getCore from 'cvat-core-wrapper';
import { ThunkAction } from 'redux-thunk';

export enum TransactionsActions {
    GET_TRANSACTIONS = 'GET_TRANSACTIONS',
    GET_TRANSACTIONS_SUCCESS = 'GET_TRANSACTIONS_SUCCESS',
    GET_TRANSACTIONS_FAILED = 'GET_TRANSACTIONS_FAILED',
}

const cvat = getCore();

export function getTransactions(): AnyAction {
    return {
        type: TransactionsActions.GET_TRANSACTIONS,
        payload: { },
    };
}

export function getTransactionsSuccess(transactions: any[]): AnyAction {
    return {
        type: TransactionsActions.GET_TRANSACTIONS_SUCCESS,
        payload: { transactions },
    };
}

export function getTransactionsFailed(error: any): AnyAction {
    return {
        type: TransactionsActions.GET_TRANSACTIONS_FAILED,
        payload: { error },
    };
}

export function getTransactionsAsync(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ActionCreator<Dispatch>): Promise<void> => {
        dispatch(getTransactions());
        let result = null;
        try {
            result = await cvat.server.request(`${cvat.config.backendAPI}/user/transactions`, {
                method: 'GET',
            });
            dispatch(getTransactionsSuccess(result));
        } catch (error) {
            dispatch(getTransactionsFailed(error));
            return;
        }
        dispatch(getTransactionsFailed(result));
    };
}
