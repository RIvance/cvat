// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Row, Col } from 'antd/lib/grid';

import DatasetItem from 'containers/datasets-page/dataset-item';

export interface Props {
    currentTasksIndexes: number[];
}

function DatasetListComponent(props: Props): JSX.Element {
    const { currentTasksIndexes } = props;
    const taskViews = currentTasksIndexes.map(
        (tid, id): JSX.Element => <DatasetItem idx={id} taskID={tid} key={tid} />,
    );

    return (
        <>
            <Row justify='center' align='middle'>
                <Col className='cvat-tasks-list' md={22} lg={18} xl={16} xxl={14}>
                    {taskViews}
                </Col>
            </Row>
            {/* <ModelRunnerModal /> */}
            {/* <MoveTaskModal /> */}
        </>
    );
}

export default React.memo(DatasetListComponent, (prev: Props, cur: Props) => (
    prev.currentTasksIndexes.length !== cur.currentTasksIndexes.length || prev.currentTasksIndexes
        .some((val: number, idx: number) => val !== cur.currentTasksIndexes[idx])
));
