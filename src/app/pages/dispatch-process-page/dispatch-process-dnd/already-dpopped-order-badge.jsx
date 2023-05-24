import React, { useState, useEffect } from 'react';
import { actions } from "../dispatch-process-reducer";
import { useDrag } from 'react-dnd';
import { actionTypesDispatchProcess, resizeDirections, strings, workOrderStatuses } from '../../../constants';
import { notification, Popconfirm, Popover } from 'antd';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import { TIMELINE_RESOLUTION_IN_FIFTEEN, TIMELINE_CELL_WIDTH, DEFAULT_UTC_OFFSET } from '../../../helpers/timeline-helper';
import moment from 'moment';
import { DispatchService, TrackingService } from '../../../services';
import { getErrorMessage } from '../../../services/tracking.service';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { getOrderBadgeColor, orderDetailsPopover } from '../../../helpers/badge-style-helper';
import CustomDurationResize from '../../../components/common/custom-duration-resize';
import TextCrop from '../../../components/common/text-crop';
import TransportationChargePopover from './transportation-charge.popover';

const AlreadyDroppedOrderBadge = (props) => {
    const [currentDate, setCurrentDate] = useState();
    const [isFirstCell, setIsFirstCell] = useState();
    const [isLastCell, setIsLastCell] = useState();
    const [isDragging, setDragging] = useState(false);
    const [cellsCount, setCellsCount] = useState();
    const {
        assignedOrder,
        index,
        timeValue,
        technician,
        unassignOrder,
        itemsCount,
        isOverlapped,
        assignedWorkOrders
    } = props;

    const [{ opacity }, dragRef, prev] = useDrag(
        () => ({
            type: 'workOrder',
            item: { workOrderId: assignedOrder.workOrder.id, dispatchRequestId: assignedOrder.dispatchRequestId, updatedItem: true },
            canDrag: assignedOrder.statusId != workOrderStatuses.Completed,
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? props.unassignWorkOrder(assignedOrder.id, assignedOrder.statusId) : setDragging(false),
            }),
            end: (item, monitor) => ({
                opacity: !monitor.didDrop() && props.assignWorkOrder(assignedOrder.id, assignedOrder.startAt, assignedOrder.technicianId, assignedOrder.endAt)
            })
        }),
        [currentDate, assignedOrder]
    )

    useEffect(() => {
        prev(getEmptyImage());
    }, []);

    useEffect(() => {
        const startDate = moment.utc(assignedOrder.startAt).utcOffset(DEFAULT_UTC_OFFSET);
        const endDate = moment.utc(assignedOrder.endAt).utcOffset(DEFAULT_UTC_OFFSET);
        const timeSection = moment(timeValue).utcOffset(DEFAULT_UTC_OFFSET);

        setIsFirstCell(startDate.isSame(timeSection));
        setIsLastCell(endDate.subtract(15, 'minutes').isSame(timeSection));
    }, [assignedOrder, timeValue])

    useEffect(() => {
        setCurrentDate(props.date);
    }, [props.date])

    useEffect(() => {
        const durationInMinutes = moment.duration(
            assignedOrder.endAt.toUTCKind().convertToEST()
                .diff(assignedOrder.startAt.toUTCKind().convertToEST())
        ).asMinutes();
        setCellsCount(Math.round(durationInMinutes / TIMELINE_RESOLUTION_IN_FIFTEEN));
    }, [assignedOrder.endAt])

    const isCompletedWorkOrders = (status) => status != workOrderStatuses.Completed;

    const handleResizeStop = async (width, direction) => {
        const actualWidth = Math.round(width / TIMELINE_CELL_WIDTH) * TIMELINE_CELL_WIDTH;

        const durationInMinutes = (actualWidth / TIMELINE_CELL_WIDTH) * TIMELINE_RESOLUTION_IN_FIFTEEN;

        const maxLeftResize = assignedOrder.workOrder.assignedDuration / TIMELINE_RESOLUTION_IN_FIFTEEN * TIMELINE_CELL_WIDTH;

        if (width > maxLeftResize && direction == resizeDirections.LEFT) {
            notification['error']({
                message: strings.COMMON.LEFT_RESIZE_ERROR,
            });
        } else {
            try {
                props.changeLoadingState(true);
                await DispatchService.changeWorkOrder({
                    dispatchRequestId: assignedOrder.dispatchRequestId,
                    workOrderId: assignedOrder.workOrderId,
                    technicianId: assignedOrder.technicianId,
                    startAt: moment.utc(assignedOrder.startAt).utcOffset(DEFAULT_UTC_OFFSET),
                    endAt: direction == resizeDirections.LEFT ? moment.utc(assignedOrder.endAt).utcOffset(DEFAULT_UTC_OFFSET).subtract(durationInMinutes, 'minutes')
                        : moment.utc(assignedOrder.endAt).utcOffset(DEFAULT_UTC_OFFSET).add(durationInMinutes, 'minutes'),
                    actionType: actionTypesDispatchProcess.UPDATE
                });
            }
            catch (error) {
                TrackingService.trackException(error);

                const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_ASSIGN);
                notification['error']({
                    message: errorMessage,
                });
                props.changeLoadingState(false);
            }
        }
    }

    const getAssignedOrderStyle = () => {
        let backgroundColor = getOrderBadgeColor(assignedOrder);

        return {
            border: isDragging && 'none !important',
            borderBottom: ((index + 1) == itemsCount) && '1px solid rgb(0, 0, 0)',
            borderLeft: (isFirstCell && itemsCount == 1) && '1px solid rgb(0, 0, 0)',
            background: backgroundColor,
            width: `${TIMELINE_CELL_WIDTH}px`,
            height: `${TIMELINE_CELL_WIDTH / itemsCount}px`
        }
    };

    return (
        <div className="cell-wrapper">
            <div ref={dragRef} className="assigned-order" style={getAssignedOrderStyle()}>
                {isFirstCell && (
                    <div className="order-info">
                        <Popover overlayClassName="order-details-popover" content={orderDetailsPopover(assignedOrder)} title={strings.COMMON.ORDER_DETAILS}>
                            <InfoCircleOutlined style={{ color: technician.color }} />
                        </Popover>
                        {
                            !isOverlapped ? (
                                <div className="order-id-line">
                                    <TextCrop inputString={assignedOrder.startAt.toUTCKind().convertToEST('HH:mm').concat(" - ",
                                        assignedOrder.project.shortName
                                            ? assignedOrder.project.shortName
                                            : assignedOrder.project.name)}
                                        style={{ width: `${(cellsCount - 1) * TIMELINE_CELL_WIDTH}px` }}
                                        isTooltipDisabled={true} />
                                    <TextCrop inputString={assignedOrder.workOrder.title}
                                        style={{ width: `${(cellsCount - 1) * TIMELINE_CELL_WIDTH}px` }}
                                        isTooltipDisabled={true} />
                                </div>
                            ) : (
                                <div className="order-id-line">
                                    <TextCrop inputString={assignedOrder.startAt.toUTCKind().convertToEST('HH:mm').concat(" - ",
                                        assignedOrder.project.shortName
                                            ? assignedOrder.project.shortName
                                            : assignedOrder.project.name)}
                                        style={{ width: `${(cellsCount - 1) * TIMELINE_CELL_WIDTH}px` }}
                                        isTooltipDisabled={true} />
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
            {isCompletedWorkOrders(assignedOrder.statusId) && isLastCell && (
                <div className="actions-block" style={{ margin: isOverlapped && 1 }}>
                    <TransportationChargePopover
                        assignedOrder={assignedOrder}
                        assignedWorkOrders={assignedWorkOrders}
                    />
                    <div className="close-order" style={{ margin: isOverlapped && 1, color: assignedOrder.statusId == workOrderStatuses.Opened && '#000 !important' }} >
                        <Popconfirm title={strings.COMMON.UNASSIGN_ORDER} 
                                    onConfirm={() => unassignOrder(
                                        assignedOrder.dispatchRequestId, 
                                        assignedOrder.startAt,
                                        assignedOrder.endAt,
                                        assignedOrder.technicianId,
                                        assignedOrder.workOrder.id,
                                        )}>
                            <CloseOutlined style={{ color: assignedOrder.statusId == workOrderStatuses.Opened && '#000 !important' }} />
                        </Popconfirm>
                    </div>
                </div>
            )
            }
            {isCompletedWorkOrders(assignedOrder.statusId) && isLastCell && (
                <CustomDurationResize
                    style={{ height: `${TIMELINE_CELL_WIDTH / itemsCount}px`, background: getOrderBadgeColor(assignedOrder) }}
                    handleResizeStop={handleResizeStop}
                    dispatchRequestWorkOrderId={assignedOrder.workOrder.dispatchRequestWorkOrderId}
                />
            )
            }
        </div>
    )
}

const mapState = ({ dispatchProcess }) => {
    return {
        date: dispatchProcess.date,
    };
};

const mapDispatch = (dispatch) => {
    return {
        changeWorkDuration(workOrderId, duration, endAt) {
            dispatch(
                actions.changeWorkDuration({
                    workOrderId,
                    duration,
                    endAt
                })
            );
        },
        unassignWorkOrder(id, statusId) {
            dispatch(actions.unassignWorkOrder({ id, statusId }));
        },
        assignWorkOrder(id, startAt, technicianId, endAt, statusId) {
            dispatch(
                actions.assignWorkOrder({
                    id,
                    startAt,
                    technicianId,
                    endAt,
                    statusId
                })
            );
        },
        changeLoadingState(value) {
            dispatch(actions.changeLoadingState(value));
        }
    };
};

export default connect(mapState, mapDispatch)(AlreadyDroppedOrderBadge);