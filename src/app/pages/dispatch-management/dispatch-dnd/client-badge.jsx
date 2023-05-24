import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { Popover } from 'antd';


const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const ClientBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, openContactsList, closeContactsList, isSelected } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'client',
            item: { clientId: item.id },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
            })
        }),
        []
    )

    const clientPopover = (client) => {
        return (
            <div className="details-popover">
                <p>Company: <span>{client.company}</span></p>
                <p>Site: <span>{client.site}</span></p>
                <p>Address: <span>{client.address}</span></p>
                <p>City: <span>{client.city}</span></p>
                <p>ZIP: <span>{client.zipCode}</span></p>
                <p>Country: <span>{client.country}</span></p>
            </div>
        )
    }

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : { borderColor: '#dae9ff' }} className="clients-list-item ant-list-item">
            <Popover content={() => clientPopover(item)}>
                <span>{item.company}</span>
            </Popover>
        </li>
    );
}

export default ClientBadge;