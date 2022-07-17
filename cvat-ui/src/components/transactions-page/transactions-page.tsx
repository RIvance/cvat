// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { getTransactionsAsync } from 'actions/transactions-actions';

interface Props {
    transactions: any[]
}

function TransactionsPageComponent(props: Props): JSX.Element {
    const { transactions } = props;
    const dispatch = useDispatch();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        dispatch(getTransactionsAsync());
        setIsMounted(true);
    }, []);

    return (
        <div>
            {transactions.toString()}
        </div>
    );
}

export default React.memo(TransactionsPageComponent);
