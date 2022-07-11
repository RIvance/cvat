// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Col } from 'antd/lib/grid';
import Icon, { CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Timeline from 'antd/lib/timeline';
import Dropdown from 'antd/lib/dropdown';

import AnnotationMenuContainer from 'containers/annotation-page/top-bar/annotation-menu';
import {
    CheckIcon, MainMenuIcon, RedoIcon, SaveIcon, UndoIcon,
} from 'icons';
import { ActiveControl, JobViewMode, ToolsBlockerState } from 'reducers/interfaces';
import CVATTooltip from 'components/common/cvat-tooltip';
import { useHistory } from 'react-router';

interface Props {
    jobInstance: any;
    viewMode: JobViewMode;
    saving: boolean;
    savingStatuses: string[];
    undoAction?: string;
    redoAction?: string;
    saveShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    drawShortcut: string;
    switchToolsBlockerShortcut: string;
    toolsBlockerState: ToolsBlockerState;
    activeControl: ActiveControl;
    onSaveAnnotation(): void;
    onFinishJob(): void;
    onReviewAccept(): void; // review mode
    onReviewReject(): void; // review mode
    onUndoClick(): void;
    onRedoClick(): void;
    onFinishDraw(): void;
    onSwitchToolsBlockerState(): void;
}

function LeftGroup(props: Props): JSX.Element {
    const {
        jobInstance,
        viewMode,
        saving,
        savingStatuses,
        undoAction,
        redoAction,
        saveShortcut,
        undoShortcut,
        redoShortcut,
        drawShortcut,
        switchToolsBlockerShortcut,
        activeControl,
        toolsBlockerState,
        onSaveAnnotation,
        onFinishJob,
        onReviewAccept,
        onReviewReject,
        onUndoClick,
        onRedoClick,
        onFinishDraw,
        onSwitchToolsBlockerState,
    } = props;

    const includesDoneButton = [
        ActiveControl.DRAW_POLYGON,
        ActiveControl.DRAW_POLYLINE,
        ActiveControl.DRAW_POINTS,
        ActiveControl.AI_TOOLS,
        ActiveControl.OPENCV_TOOLS,
    ].includes(activeControl);

    const includesToolsBlockerButton =
        [ActiveControl.OPENCV_TOOLS, ActiveControl.AI_TOOLS].includes(activeControl) && toolsBlockerState.buttonVisible;

    const shouldEnableToolsBlockerOnClick = [ActiveControl.OPENCV_TOOLS].includes(activeControl);
    const history = useHistory();

    return (
        <>
            <Modal title='Saving changes on the server' visible={saving} footer={[]} closable={false}>
                <Timeline pending={savingStatuses[savingStatuses.length - 1] || 'Pending..'}>
                    {savingStatuses.slice(0, -1).map((status: string, id: number) => (
                        <Timeline.Item key={id}>{status}</Timeline.Item>
                    ))}
                </Timeline>
            </Modal>
            <Col className='cvat-annotation-header-left-group'>
                <Dropdown overlay={<AnnotationMenuContainer viewMode={viewMode} />}>
                    <Button type='link' className='cvat-annotation-header-button'>
                        <Icon component={MainMenuIcon} />
                        Menu
                    </Button>
                </Dropdown>
                {(viewMode === JobViewMode.EDIT ? (
                    <>
                        <CVATTooltip overlay={`Save current changes ${saveShortcut}`}>
                            <Button
                                onClick={saving ? undefined : onSaveAnnotation}
                                type='link'
                                className={saving ? 'cvat-annotation-disabled-header-button' : 'cvat-annotation-header-button'}
                            >
                                <Icon component={SaveIcon} />
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </CVATTooltip>
                        <CVATTooltip overlay='Finish Annotation'>
                            <Button
                                type='link'
                                className='cvat-annotation-header-button'
                                onClick={(e) => {
                                    e.preventDefault();
                                    onFinishJob();
                                    history.push(`tasks/${jobInstance.taskId}`);
                                }}
                            >
                                <Icon component={CheckIcon} />
                                Finish
                            </Button>
                        </CVATTooltip>
                        <CVATTooltip overlay={`Undo: ${undoAction} ${undoShortcut}`}>
                            <Button
                                style={{ pointerEvents: undoAction ? 'initial' : 'none', opacity: undoAction ? 1 : 0.5 }}
                                type='link'
                                className='cvat-annotation-header-button'
                                onClick={onUndoClick}
                            >
                                <Icon component={UndoIcon} />
                                <span>Undo</span>
                            </Button>
                        </CVATTooltip>
                        <CVATTooltip overlay={`Redo: ${redoAction} ${redoShortcut}`}>
                            <Button
                                style={{ pointerEvents: redoAction ? 'initial' : 'none', opacity: redoAction ? 1 : 0.5 }}
                                type='link'
                                className='cvat-annotation-header-button'
                                onClick={onRedoClick}
                            >
                                <Icon component={RedoIcon} />
                            Redo
                            </Button>
                        </CVATTooltip>
                    </>
                ) :
                    viewMode === JobViewMode.REVIEW ? (
                        <>
                            <CVATTooltip overlay='Finish review and accept the annotation'>
                                <Button
                                    type='link'
                                    className='cvat-annotation-header-button'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onReviewAccept();
                                        history.push(`tasks/${jobInstance.taskId}`);
                                    }}
                                >
                                    <Icon component={CheckIcon} />
                                Accept
                                </Button>
                            </CVATTooltip>
                            <CVATTooltip overlay='Finish review and reject the annotation'>
                                <Button
                                    type='link'
                                    className='cvat-annotation-header-button'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onReviewReject();
                                        history.push(`tasks/${jobInstance.taskId}`);
                                    }}
                                >
                                    <Icon component={CheckIcon} />
                                Reject
                                </Button>
                            </CVATTooltip>
                        </>
                    ) : null
                )}
                {includesDoneButton ? (
                    <CVATTooltip overlay={`Press "${drawShortcut}" to finish`}>
                        <Button type='link' className='cvat-annotation-header-button' onClick={onFinishDraw}>
                            <CheckCircleOutlined />
                            Done
                        </Button>
                    </CVATTooltip>
                ) : null}
                {includesToolsBlockerButton ? (
                    <CVATTooltip overlay={`Press "${switchToolsBlockerShortcut}" to postpone running the algorithm `}>
                        <Button
                            type='link'
                            className={`cvat-annotation-header-button ${
                                toolsBlockerState.algorithmsLocked ? 'cvat-button-active' : ''
                            }`}
                            onClick={shouldEnableToolsBlockerOnClick ? onSwitchToolsBlockerState : undefined}
                        >
                            <StopOutlined />
                            Block
                        </Button>
                    </CVATTooltip>
                ) : null}
            </Col>
        </>
    );
}

export default React.memo(LeftGroup);
