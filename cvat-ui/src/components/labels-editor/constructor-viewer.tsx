// Copyright (C) 2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';

import ConstructorViewerItem from './constructor-viewer-item';
import { Label } from './common';

interface ConstructorViewerProps {
    isEditable: boolean;
    labels: Label[];
    onUpdate: (label: Label) => void;
    onDelete: (label: Label) => void;
    onCreate: () => void;
}

export default function ConstructorViewer(props: ConstructorViewerProps): JSX.Element {
    const { isEditable, onCreate } = props;
    const list = isEditable ? [
        <Button key='create' type='ghost' onClick={onCreate} className='cvat-constructor-viewer-new-item'>
            Add label
            <PlusCircleOutlined />
        </Button>,
    ] : [];
    for (const label of props.labels) {
        list.push(
            <ConstructorViewerItem
                isEditable={isEditable}
                onUpdate={props.onUpdate}
                onDelete={props.onDelete}
                label={label}
                key={label.id}
                color={label.color}
            />,
        );
    }

    return <div className='cvat-constructor-viewer'>{list}</div>;
}
