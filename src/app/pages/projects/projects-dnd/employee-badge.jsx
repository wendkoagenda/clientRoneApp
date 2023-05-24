import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Popover } from 'antd';
import { TextCrop } from '../../../components/common';

const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const EmployeeBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, clientId, isSelected } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'employee',
            item: { clientId: clientId, contactId: item.id },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false)
            })
        }),
        []
    )

    const employeePopover = (employee) => {
        return (
            <div className="details-popover">
                <p>Name: <span>{employee.fullName}</span></p>
                <p>Email: <span>{employee.email}</span></p>
                <p>Address: <span>{employee.address}</span></p>
                <p>City: <span>{employee.city}</span></p>
                <p>ZIP: <span>{employee.zipCode}</span></p>
                <p>Country: <span>{employee.country}</span></p>
            </div>
        )
    }

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : { borderColor: '#bff6de' }} className="employees-list-item ant-list-item">
            <span>
                <TextCrop icon={false} title="Contact" inputString={item.fullName} content={employeePopover(item)} />
            </span>
        </li>
    );
}

export default EmployeeBadge;