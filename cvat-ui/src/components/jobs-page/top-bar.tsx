// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { Col, Row } from 'antd/lib/grid';
import Input from 'antd/lib/input';

import { JobsQuery } from 'reducers/interfaces';
import { SortingComponent, ResourceFilterHOC, defaultVisibility } from 'components/resource-sorting-filtering';
import {
    localStorageRecentKeyword, localStorageRecentCapacity, predefinedFilterValues, config,
} from './jobs-filter-configuration';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FilteringComponent = ResourceFilterHOC(
    config, localStorageRecentKeyword, localStorageRecentCapacity, predefinedFilterValues,
);

interface Props {
    query: JobsQuery;
    onApplyFilter(filter: string | null): void;
    onApplySorting(sorting: string | null): void;
    onApplySearch(search: string | null): void;
}

function TopBarComponent(props: Props): JSX.Element {
    const {
        query, onApplySorting, onApplySearch,
    } = props;
    const [visibility, setVisibility] = useState(defaultVisibility);

    return (
        <Row className='cvat-jobs-page-top-bar' justify='center' align='middle'>
            <Col md={22} lg={18} xl={16} xxl={16}>
                <div>
                    <Input.Search
                        enterButton
                        onSearch={(phrase: string) => {
                            onApplySearch(phrase);
                        }}
                        defaultValue={query.search || ''}
                        className='cvat-jobs-page-search-bar'
                        placeholder='Search ...'
                    />
                    <div>
                        <SortingComponent
                            visible={visibility.sorting}
                            onVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, sorting: visible })
                            )}
                            defaultFields={query.sort?.split(',') || ['-ID']}
                            sortingFields={['ID', 'Updated date', 'Task ID', 'Task name']}
                            onApplySorting={onApplySorting}
                        />
                        {/* <FilteringComponent */}
                        {/*    value={query.filter} */}
                        {/*    predefinedVisible={visibility.predefined} */}
                        {/*    builderVisible={visibility.builder} */}
                        {/*    recentVisible={visibility.recent} */}
                        {/*    onPredefinedVisibleChange={(visible: boolean) => ( */}
                        {/*        setVisibility({ ...defaultVisibility, predefined: visible }) */}
                        {/*    )} */}
                        {/*    onBuilderVisibleChange={(visible: boolean) => ( */}
                        {/*        setVisibility({ ...defaultVisibility, builder: visible }) */}
                        {/*    )} */}
                        {/*    onRecentVisibleChange={(visible: boolean) => ( */}
                        {/*      setVisibility({...defaultVisibility, builder: visibility.builder, recent: visible}) */}
                        {/*    )} */}
                        {/*    onApplyFilter={onApplyFilter} */}
                        {/* /> */}
                    </div>
                </div>
            </Col>
        </Row>
    );
}

export default React.memo(TopBarComponent);
