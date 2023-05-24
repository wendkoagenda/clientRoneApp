import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import { actions } from "../dispatch-process-reducer";
import { useDrag } from 'react-dnd';
import { Row, Tooltip, Popover } from 'antd';
import { badgePosition, strings } from '../../../constants';
import {
    DoubleRightOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import { cropText } from '../../../helpers/text.helper';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { getOrderBadgeColor, orderDetailsPopover } from '../../../helpers/badge-style-helper';

const WorkOrderBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const [isDetailsPopoverVisible, setDetailsPopoverVisible] = useState({
        id: null,
        visible: false
    });

    const { item, handleMovingToOrder, isSelected, selectedItem } = props;

    const [{ opacity }, dragRef, preview] = useDrag(
        () => ({
            type: 'workOrder',
            item: { workOrderId: item.workOrder.id, dispatchRequestId: item.dispatchRequestId, position: badgePosition.LEFT_SIDEBAR },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
            })
        }),
        []
    )

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        document.querySelector('.work-order-label').ondragstart = () => { return false }
    }, []);

    const handleLabelOver = () => {
        document.querySelector('.work-order-badge').ondragstart = () => { return false }
    }

    const handlePopoverEnter = (id) => {
        setDetailsPopoverVisible({
            id: id,
            visible: true
        });
    }

    const handlePopoverLeave = () => {
        setDetailsPopoverVisible({
            id: null,
            visible: false
        });
    }

    const defaultStyle = {
        borderColor: '#fff',
        borderBottom: '2px solid #fff',
        fontSize: '16px',
        fontWeight: '500',
        height: '55px',
        background: selectedItem ? getOrderBadgeColor(selectedItem) : '#878787',
        color: '#fff'
    }

    const selectedStyle = {
        borderBottom: '2px solid #fff',
        color: '#000000',
        background: selectedItem ? getOrderBadgeColor(selectedItem) : '#878787',
        fontSize: '16px',
        fontWeight: '500',
        height: '55px'
    }

    const orderLabel = `${item.workOrder.startDate.toUTCKind().convertToEST('HH:mm')} - ${item.workOrder.title} - ${item.project.name}`;

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : defaultStyle} className="work-order-badge ant-list-item">
            <Row className="badge-title">
                <Popover
                    overlayClassName="order-details-popover"
                    visible={isDetailsPopoverVisible.visible && isDetailsPopoverVisible.id == item.workOrder.id && !isDragging}
                    destroyTooltipOnHide={true}
                    content={orderDetailsPopover(item)}
                    title={strings.COMMON.ORDER_DETAILS}
                    placement="right"
                    trigger="click"
                    onVisibleChange={v => !v ? handlePopoverLeave() : () => { }}
                >
                    <InfoCircleOutlined
                        style={{ pointerEvents: "all" }}
                        onClick={() => handlePopoverEnter(item.workOrder.id)}
                    />
                    {cropText(orderLabel, 30)}
                </Popover>
            </Row>
            <Row align="middle">
                <span className="work-order-label" onMouseEnter={handleLabelOver} style={{ marginRight: '10px', marginBottom: '2px' }}>{item.workOrder.type}</span>
            </Row>
            {isSelected &&
                <Tooltip title={strings.COMMON.MOVE_TO_ORDER}>
                    <DoubleRightOutlined onClick={() => handleMovingToOrder(item.id)} style={{ cursor: 'pointer', pointerEvents: 'all' }} />
                </Tooltip>
            }
        </li>
    );
}

const mapState = ({ dispatchProcess }) => {
    return {
        assignedWorkOrders: dispatchProcess.assignedWorkOrders,
        technicians: dispatchProcess.technicians
    };
};

const mapDispatch = (dispatch) => {
    return {
        setNewDate(value) {
            dispatch(actions.setNewDate(value));
        }
    }
};

export default connect(mapState, mapDispatch)(WorkOrderBadge);