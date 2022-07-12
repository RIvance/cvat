// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { AnyAction } from 'redux';
import { UserAssetsState } from './interfaces';
import { UserAssetsActions } from '../actions/user-assets-actions';

const defaultState: UserAssetsState = {
    fund: 0,
    datasets: [],
};

export default (state: UserAssetsState = defaultState, action: AnyAction): UserAssetsState => {
    switch (action.type) {
        case UserAssetsActions.GET_FUND_SUCCESS: {
            return {
                ...state,
                fund: action.payload.fund,
            };
        }
        default: {
            return state;
        }
    }
};
