import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { Popover } from 'antd';
import TextCrop from '../../../components/common/text-crop';


const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit',
}

const SubWorkOrderBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, parentId, onCollapse, onLoad, dispatchesLoaded, isSelected, workType } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'workOrder',
            item: { workOrderId: item.id, workType: workType },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
            })
        }),
        [item]
    );

    const orderPopover = (order) => {
        return (
            <div className="details-popover">
                <p>Id: <span>{order.id}</span></p>
                <p>Title: <span>{order.title}</span></p>
            </div>
        );
    };

    const workOrderMark = (order) => {
        return (
            <Popover overlayStyle={{ width: '20%', fontSize: '16px' }} content={orderPopover(order)} title={order.title}>
                <div className="mark-dot" />
            </Popover>
        );
    };

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : { background: '#00dc7d40', borderColor: '#bff6de' }} className="clients-list-item order-badge-body ant-list-item">
            {workOrderMark(item)}
            <TextCrop inputString={item.title} title="Title" content={orderPopover(item)} />
        </li>
    );
}

export default SubWorkOrderBadge;