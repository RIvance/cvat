// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';

import { TasksQuery } from 'reducers/interfaces';
import Empty from 'antd/lib/empty';

interface Props {
    query: TasksQuery;
}

function EmptyListComponent(props: Props): JSX.Element {
    const { query } = props;

    return (
        <div className='cvat-empty-tasks-list'>
            <Empty description={(!query.filter && !query.search && !query.page) ? (
                <>
                    <Row justify='center' align='middle'>
                        <Col>
                            <Text strong>No datasets available yet ...</Text>
                        </Col>
                    </Row>
                </>
            ) : (<Text>No results matched your search</Text>)}
            />
        </div>
    );
}

export default React.memo(EmptyListComponent);
