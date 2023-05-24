import React from 'react';
import { useDragLayer } from 'react-dnd';
import { CloseOutlined } from '@ant-design/icons';
import { getOrderBadgeColor } from '../../../helpers/badge-style-helper';
import { TIMELINE_CELL_WIDTH, TIMELINE_RESOLUTION_IN_FIFTEEN } from '../../../helpers/timeline-helper';

const CustomDragLayer = (props) => {

    const { itemType, isDragging, item, initialOffset, currentOffset, } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    const getItemStyles = (item, initialOffset, currentOffset) => {
        const orderItem = props.workOrders.find(wo => wo.workOrderId == item.workOrderId);

        if (!initialOffset || !currentOffset) {
            return {
                display: 'none',
            };
        }

        let { x, y } = currentOffset;

        const transform = `translate(${x}px, ${y}px)`;

        return {
            transform,
            WebkitTransform: transform,
            background: getOrderBadgeColor(orderItem),
            width: `${orderItem.workOrder.estimatedDuration / TIMELINE_RESOLUTION_IN_FIFTEEN * TIMELINE_CELL_WIDTH}px`
        };
    }

    const renderLayer = () => {
        const orderItem = props.workOrders.find(wo => wo.workOrderId == item?.workOrderId);

        if (!isDragging) {
            return null;
        }

        return (
            <div className="custom-drag-layer" style={getItemStyles(item, initialOffset, currentOffset)}>
                <p>#{orderItem?.workOrder?.id}</p>
                <div className="close-order">
                    <CloseOutlined />
                </div>
            </div>
        )
    }

    return (
        renderLayer()
    )
}

export default CustomDragLayer;