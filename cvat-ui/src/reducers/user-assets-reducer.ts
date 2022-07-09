// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { AnyAction } from 'redux';
import { UserAssetsState } from './interfaces';
import { UserAssetsActions } from '../actions/user-assets-actions';

const defaultState: UserAssetsState = {
    ownedPoints: 0,
    datasets: [],
};

export default (state: UserAssetsState = defaultState, action: AnyAction): UserAssetsState => {
    switch (action.type) {
        case UserAssetsActions.GET_OWNED_POINTS_SUCCESS: {
            return {
                ...state,
                ownedPoints: action.payload.ownedPoints,
            };
        }
        default: {
            return state;
        }
    }
};
