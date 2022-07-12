// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import 'react-awesome-query-builder/lib/css/styles.css';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import {
    Config, ImmutableTree, Utils as QbUtils,
} from 'react-awesome-query-builder';
import {
    FilterFilled, FilterOutlined,
} from '@ant-design/icons';
import Dropdown from 'antd/lib/dropdown';
import Button from 'antd/lib/button';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox';
import { useSelector } from 'react-redux';
import { CombinedState } from 'reducers/interfaces';
import { User } from 'components/task-page/user-selector';

interface ResourceFilterProps {
    predefinedVisible: boolean;
    recentVisible: boolean;
    builderVisible: boolean;
    value: string | null;
    onPredefinedVisibleChange(visible: boolean): void;
    onBuilderVisibleChange(visible: boolean): void;
    onRecentVisibleChange(visible: boolean): void;
    onApplyFilter(filter: string | null): void;
}

export default function ResourceFilterHOC(
    filtrationCfg: Partial<Config>,
    localStorageRecentKeyword: string,
    localStorageRecentCapacity: number,
    predefinedFilterValues: Record<string, string>,
): React.FunctionComponent<ResourceFilterProps> {
    const config: Config = { ...AntdConfig, ...filtrationCfg };
    const defaultTree = QbUtils.checkTree(
        QbUtils.loadTree({ id: QbUtils.uuid(), type: 'group' }), config,
    ) as ImmutableTree;

    function receiveRecentFilters(): Record<string, string> {
        let recentFilters: string[] = [];
        try {
            recentFilters = JSON.parse(localStorage.getItem(localStorageRecentKeyword) || '[]');
            if (!Array.isArray(recentFilters) || recentFilters.some((item: any) => typeof item !== 'string')) {
                throw new Error('Wrong filters value stored');
            }
        } catch (_: any) {
            // nothing to do
        }

        return recentFilters
            .reduce((acc: Record<string, string>, val: string) => ({ ...acc, [val]: val }), {});
    }

    const defaultAppliedFilter: {
        predefined: string[] | null;
        recent: string | null;
        built: string | null;
    } = {
        predefined: null,
        recent: null,
        built: null,
    };

    function isValidTree(tree: ImmutableTree): boolean {
        return (QbUtils.queryString(tree, config) || '').trim().length > 0 && QbUtils.isValidTree(tree);
    }

    function unite(filters: string[]): string {
        if (filters.length > 1) {
            return JSON.stringify({
                and: filters.map((filter: string): JSON => JSON.parse(filter)),
            });
        }

        return filters[0];
    }

    function getPredefinedFilters(user: User): Record<string, string> {
        const result: Record<string, string> = {};
        if (user) {
            for (const key of Object.keys(predefinedFilterValues)) {
                result[key] = predefinedFilterValues[key].replace('<username>', `${user.username}`);
            }
        }

        return result;
    }

    function ResourceFilterComponent(props: ResourceFilterProps): JSX.Element {
        const {
            predefinedVisible, value,
            onPredefinedVisibleChange, onBuilderVisibleChange, onRecentVisibleChange, onApplyFilter,
        } = props;

        const user = useSelector((state: CombinedState) => state.auth.user);
        const [isMounted, setIsMounted] = useState<boolean>(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [recentFilters, setRecentFilters] = useState<Record<string, string>>({});
        const [appliedFilter, setAppliedFilter] = useState(defaultAppliedFilter);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [state, setState] = useState<ImmutableTree>(defaultTree);

        useEffect(() => {
            setRecentFilters(receiveRecentFilters());
            setIsMounted(true);

            const listener = (event: MouseEvent): void => {
                const path: HTMLElement[] = event.composedPath()
                    .filter((el: EventTarget) => el instanceof HTMLElement) as HTMLElement[];
                if (path.some((el: HTMLElement) => el.id === 'root') && !path.some((el: HTMLElement) => el.classList.contains('ant-btn'))) {
                    onBuilderVisibleChange(false);
                    onRecentVisibleChange(false);
                }
            };

            try {
                if (value) {
                    const tree = QbUtils.loadFromJsonLogic(JSON.parse(value), config);
                    if (tree && isValidTree(tree)) {
                        setAppliedFilter({
                            ...appliedFilter,
                            built: JSON.stringify(QbUtils.jsonLogicFormat(tree, config).logic),
                        });
                        setState(tree);
                    }
                }
            } catch (_: any) {
                // nothing to do
            }

            window.addEventListener('click', listener);
            return () => window.removeEventListener('click', listener);
        }, []);

        useEffect(() => {
            if (!isMounted) {
                // do not request resources until on mount hook is done
                return;
            }

            if (appliedFilter.predefined?.length) {
                onApplyFilter(unite(appliedFilter.predefined));
            } else if (appliedFilter.recent) {
                onApplyFilter(appliedFilter.recent);
                const tree = QbUtils.loadFromJsonLogic(JSON.parse(appliedFilter.recent), config);
                if (isValidTree(tree)) {
                    setState(tree);
                }
            } else if (appliedFilter.built) {
                if (value !== appliedFilter.built) {
                    onApplyFilter(appliedFilter.built);
                }
            } else {
                onApplyFilter(null);
                setState(defaultTree);
            }
        }, [appliedFilter]);

        const predefinedFilters = getPredefinedFilters(user);
        return (
            <div className='cvat-resource-page-filters'>
                <Dropdown
                    destroyPopupOnHide
                    visible={predefinedVisible}
                    placement='bottomLeft'
                    overlay={(
                        <div className='cvat-resource-page-predefined-filters-list'>
                            {Object.keys(predefinedFilters).map((key: string): JSX.Element => (
                                <Checkbox
                                    checked={appliedFilter.predefined?.includes(predefinedFilters[key])}
                                    onChange={(event: CheckboxChangeEvent) => {
                                        let updatedValue: string[] | null = appliedFilter.predefined || [];
                                        if (event.target.checked) {
                                            updatedValue.push(predefinedFilters[key]);
                                        } else {
                                            updatedValue = updatedValue
                                                .filter((appliedValue: string) => (
                                                    appliedValue !== predefinedFilters[key]
                                                ));
                                        }

                                        if (!updatedValue.length) {
                                            updatedValue = null;
                                        }

                                        setAppliedFilter({
                                            ...defaultAppliedFilter,
                                            predefined: updatedValue,
                                        });
                                    }}
                                    key={key}
                                >
                                    {key}
                                </Checkbox>
                            )) }
                        </div>
                    )}
                >
                    <Button type='default' onClick={() => onPredefinedVisibleChange(!predefinedVisible)}>
                        Filters
                        { appliedFilter.predefined ?
                            <FilterFilled /> :
                            <FilterOutlined />}
                    </Button>
                </Dropdown>
                <Button
                    disabled={!(appliedFilter.built || appliedFilter.predefined || appliedFilter.recent)}
                    size='small'
                    type='link'
                    onClick={() => { setAppliedFilter({ ...defaultAppliedFilter }); }}
                >
                    Clear filters
                </Button>
            </div>
        );
    }

    return React.memo(ResourceFilterComponent);
}
