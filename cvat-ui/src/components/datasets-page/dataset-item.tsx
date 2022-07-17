// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { RouteComponentProps } from 'react-router';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import moment from 'moment';

import { ActiveInference } from 'reducers/interfaces';
import { withRouter } from 'react-router-dom';
import { DollarCircleOutlined } from '@ant-design/icons';

export interface DataSetItemProps {
    taskInstance: any;
    previewImage: string;
    deleted: boolean;
    hidden: boolean;
    activeInference: ActiveInference | null;
    purchasedList: number[];
    purchaseDataset(taskID: number): void;
    exportDataset(taskInstance: any): void;
    cancelAutoAnnotation(): void;
}

class DatasetItemComponent extends React.PureComponent<DataSetItemProps & RouteComponentProps> {
    private renderPreview(): JSX.Element {
        const { previewImage } = this.props;
        return (
            <Col span={4}>
                <div className='cvat-task-item-preview-wrapper'>
                    <img alt='Preview' className='cvat-task-item-preview' src={previewImage} />
                </div>
            </Col>
        );
    }

    private renderDescription(): JSX.Element {
        // Task info
        const { taskInstance } = this.props;
        const { id } = taskInstance;
        const owner = taskInstance.owner ? taskInstance.owner.username : null;
        const updated = moment(taskInstance.updatedDate).fromNow();
        const created = moment(taskInstance.createdDate).format('MMMM Do YYYY');

        // Get and truncate a task name
        const name = `${taskInstance.name.substring(0, 70)}${taskInstance.name.length > 70 ? '...' : ''}`;

        return (
            <Col span={10} className='cvat-task-item-description'>
                <Text strong type='secondary' className='cvat-item-task-id'>{`#${id}: `}</Text>
                <Text strong className='cvat-item-task-name'>
                    {name}
                </Text>
                <br />
                {owner && (
                    <>
                        <Text type='secondary'>{`Created ${owner ? `by ${owner}` : ''} on ${created}`}</Text>
                        <br />
                    </>
                )}
                <Text type='secondary'>{`Last updated ${updated}`}</Text>
            </Col>
        );
    }

    private renderNavigation(): JSX.Element {
        const {
            taskInstance, purchasedList, history, purchaseDataset, exportDataset,
        } = this.props;
        const { id } = taskInstance;

        return (
            <Col>
                <Button
                    className='cvat-item-open-dataset-button'
                    type='primary'
                    size='large'
                    ghost
                    onClick={(e: React.MouseEvent): void => {
                        history.push(`/tasks/${taskInstance.id}/jobs/${taskInstance.jobs[0].id}`);
                        e.preventDefault();
                    }}
                >
                        Preview
                </Button>
                {purchasedList.includes(id) ? (
                    <Button
                        className='cvat-item-open-dataset-button'
                        type='primary'
                        size='large'
                        ghost
                        onClick={(e: React.MouseEvent): void => {
                            e.preventDefault();
                            exportDataset(taskInstance);
                        }}
                    >
                            Download
                    </Button>
                ) : (
                    <Button
                        className='cvat-item-open-dataset-button'
                        type='primary'
                        size='large'
                        ghost
                        onClick={(e: React.MouseEvent): void => {
                            e.preventDefault();
                            purchaseDataset(taskInstance.id);
                        }}
                    >
                            Purchase
                        <DollarCircleOutlined />
                        {` ${Math.floor(taskInstance.size / 10)}`}
                    </Button>
                )}
            </Col>
        );
    }

    public render(): JSX.Element {
        const { deleted, hidden } = this.props;
        const style = {};
        if (deleted) {
            (style as any).pointerEvents = 'none';
            (style as any).opacity = 0.5;
        }

        if (hidden) {
            (style as any).display = 'none';
        }

        return (
            // taskInstance.status === TaskStatus.COMPLETED ? (
            <Row className='cvat-datasets-list-item' justify='center' align='top' style={{ ...style }}>
                {this.renderPreview()}
                {this.renderDescription()}
                {this.renderNavigation()}
            </Row>
            // ) : <></>
        );
    }
}

export default withRouter(DatasetItemComponent);
