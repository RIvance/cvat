// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { AnyAction } from 'redux';
import { TransactionsState } from './interfaces';
import { TransactionsActions } from '../actions/transactions-actions';

const defaultState: TransactionsState = {
    transactions: [],
};

export default (state: TransactionsState = defaultState, action: AnyAction): TransactionsState => {
    switch (action.type) {
        case TransactionsActions.GET_TRANSACTIONS_SUCCESS: {
            return {
                ...state,
                transactions: action.payload.transactions,
            };
        }
        default: {
            return state;
        }
    }
};
