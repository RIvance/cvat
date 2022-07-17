// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';
import { CombinedState } from 'reducers/interfaces';
import TransactionPageComponent from 'components/transactions-page/transactions-page';

interface StateToProps {
    transactions: any[];
}

function mapStateToProps(state: CombinedState): StateToProps {
    return {
        transactions: state.transactions.transactions,
    };
}

export default connect(mapStateToProps)(TransactionPageComponent);
