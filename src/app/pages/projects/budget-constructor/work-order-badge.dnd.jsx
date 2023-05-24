import React from 'react';
import { useDrag } from 'react-dnd';
import { Row} from 'antd';
import { TextCropCell } from '../../../components/common';
import { connect } from "react-redux";
import { actions } from './budget-reducer';
import {
    PlusOutlined
} from "@ant-design/icons";

const WorkOrderBadge = (props) => {
    const { item, isSelected, assignWorkOrder } = props;

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: 'workOrder',
            item: { workOrder: item.workOrder },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }), [])

    const defaultStyle = {
        borderColor: '#fff',
        borderBottom: '2px solid #fff',
        fontSize: '16px',
        fontWeight: '500',
        height: '55px',
        background: '#dae9ff',
        color: '#03146F'
    }

    const selectedStyle = {
        borderBottom: '2px solid #fff',
        color: '#fff',
        background: '#bbbbbb',
        fontSize: '16px',
        fontWeight: '500',
        height: '55px',
        pointerEvents: 'none',
        cursor: 'no-drop'
    }

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : defaultStyle} className="work-order-badge ant-list-item">
            <Row align="middle">
                <PlusOutlined  onClick={() => assignWorkOrder(item.workOrder)}/>
                <TextCropCell inputString={item.workOrder.title} title="Description" />
            </Row>
        </li>
    );
}

const mapDispatch = (dispatch) => {
    return {
        assignWorkOrder(value) {
            dispatch(actions.assignWorkOrder(value));
        }
    }
}

export default connect(null, mapDispatch)(WorkOrderBadge);