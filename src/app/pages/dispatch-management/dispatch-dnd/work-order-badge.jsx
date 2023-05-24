import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { Row } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';


const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const WorkOrderBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, setHide, onCollapse, onLoad, dispatchesLoaded, isSelected } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'workOrder',
            item: { workOrderId: item.id, type: 'parent' },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
            })
        }),
        []
    )

    const orderLabel = `WO - #${item.id}`;

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : { borderColor: '#dae9ff' }} className="clients-list-item order-badge-body ant-list-item">
            <Row>
                <div className="mark-dot" />
                <span>{orderLabel}</span>
            </Row>
            <Row align="middle">
                <span style={{ marginRight: '10px', marginBottom: '2px'}}>{item.type}</span>
                {
                    !item.isHidedSub ? (
                        <CloseCircleOutlined style={{ pointerEvents: 'all' }} onClick={() => setHide(item.id, true)} />
                    ) : (
                        <PlusCircleOutlined style={{ pointerEvents: 'all' }} onClick={() => setHide(item.id, false)} />
                    )
                }
            </Row>
        </li>
    );
}

export default WorkOrderBadge;