import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { connect } from "react-redux";
import AlreadyDroppedOrderBadge from "./already-dpopped-order-badge";
import moment from 'moment';
import { DEFAULT_UTC_OFFSET, HOURS_IN_DAY, MINUTES_IN_HOUR, TIMELINE_RESOLUTION_IN_FIFTEEN, isCurrentTime } from '../../../helpers/timeline-helper';
import { Modal } from "antd";
import {
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { badgePosition, strings, workOrderStatuses } from "../../../constants";

const { confirm } = Modal;

const WorkOrderDropArea = (props) => {
    const [orderId, setOrderId] = useState();
    const [assignedOrder, setOrder] = useState();
    const [isCurrentTimeNow, setIsCurrentTimeNow] = useState(false);

    const {
        assignedOrders,
        onDrop,
        timeValue,
        technician,
        timeline,
        unassignOrder,
        assignedWorkOrder,
        handleMovingToStartOfDay,
        assignedWorkOrders
    } = props;

    const dropAction = (item, monitor) => {
        setOrderId(item.workOrderId);

        const unassignWorkOrder = props.unassignWorkOrders.find(
            (wo) => wo.workOrder.id == item.workOrderId &&
                wo.dispatchRequestId == item.dispatchRequestId
        );

        let startDate = moment.utc(timeValue);
        let endDate = moment.utc(timeValue).add('minutes', Math.ceil(unassignWorkOrder.workOrder.estimatedDuration / TIMELINE_RESOLUTION_IN_FIFTEEN) * TIMELINE_RESOLUTION_IN_FIFTEEN);
        let isEstimatedDate = startDate.convertToEST().isSame(unassignWorkOrder.workOrder.startDate.toUTCKind().convertToEST());

        if (unassignWorkOrder.workOrder.isFullTimeWorkOrder) {
            startDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            endDate.set({ hour: 24, minute: 0, second: 0, millisecond: 0 })
        }

        if ((!isEstimatedDate && item.position == badgePosition.LEFT_SIDEBAR) || unassignWorkOrder.isConfirmed) {
            confirm({
                title: unassignWorkOrder.isConfirmed ? strings.COMMON.REASSIGN_CONFIRMED : strings.COMMON.NON_ESTIMATED_DATE_CONFIRMATION,
                icon: <ExclamationCircleOutlined />,
                onOk() {
                    onDrop(item, startDate.format(), endDate.format(), technician);
                },
                onCancel() {
                    return null;
                },
            });
        } else {
            onDrop(item, startDate.format(), endDate.format(), technician);
        }

        const currentValue = timeValue.toString().toUTCKind().convertToEST();
        const difference = ((HOURS_IN_DAY * MINUTES_IN_HOUR) - (currentValue.hours() * MINUTES_IN_HOUR + currentValue.minutes()));

        if (unassignWorkOrder.workOrder.estimatedDuration > difference && !startDate.convertToEST().isSame(endDate.convertToEST(), 'day')) {
            setTimeout(() => {
                handleMovingToStartOfDay();
            }, 100)
        }
    };

    const [collectedProps, drop] = useDrop(
        () => ({
            accept: "workOrder",
            drop: (item, monitor) => dropAction(item, monitor),
            collect: monitor => ({
                isActive: monitor.canDrop() && monitor.isOver(),
            })
        }),
        [assignedOrders, timeValue, props.unassignWorkOrders]
    );

    useEffect(() => {
        setOrder(assignedWorkOrder);
    }, [assignedWorkOrder])

    useEffect(() => {
        const timeSection = moment(timeValue).utcOffset(DEFAULT_UTC_OFFSET);
        const currentTime = isCurrentTime(timeSection)

        setIsCurrentTimeNow(currentTime);
    }, [assignedOrders, props.date]);


    return (
        <div
            ref={drop}
            className="timeline-drop-area"
        >
            {assignedOrder?.length ? assignedOrder.map((item, key) => {
                return (
                    <AlreadyDroppedOrderBadge
                        key={key}
                        index={key}
                        assignedOrder={item}
                        timeValue={timeValue}
                        technician={technician}
                        timeline={timeline}
                        unassignOrder={unassignOrder}
                        itemsCount={assignedOrder.length}
                        assignedWorkOrders={assignedWorkOrders}
                        isOverlapped={assignedWorkOrders.some(x =>
                            !x.workOrder.isFullTimeWorkOrder &&
                            x.id != item.id &&
                            x.technicianId == item.technicianId && (
                                (item.startAt <= x.startAt && item.endAt > x.startAt) ||
                                (item.startAt < x.endAt && item.endAt > x.endAt) ||
                                (item.startAt == x.startAt && item.endAt == x.endAt) ||
                                (item.startAt < x.startAt && item.endAt > x.endAt) ||
                                (item.startAt > x.startAt && item.endAt <= x.endAt)
                            )
                        )}
                    />
                )
            }) : (
                <div
                    className="timeline-empty-block"
                    style={{
                        borderLeft:
                            moment(timeValue).hours() == "0" &&
                            moment(timeValue).minutes() == "00" &&
                            "1px solid #000",
                        // eslint-disable-next-line no-dupe-keys
                        borderLeft: isCurrentTimeNow && "3px solid #ff4444",
                        background: collectedProps.isActive ? "#C9FFBF" : "#fff"
                    }}
                ></div>
            )}
        </div>
    );
};

const mapState = ({ dispatchProcess }) => {
    return {
        date: dispatchProcess.date,
        assignedWorkOrders: dispatchProcess.assignedWorkOrders,
        unassignWorkOrders: dispatchProcess.unassignWorkOrders
    };
};

export default connect(mapState, null)(WorkOrderDropArea);
