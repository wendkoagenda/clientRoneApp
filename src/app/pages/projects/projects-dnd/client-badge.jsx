import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import TextCrop from '../../../components/common/text-crop';
import { Tooltip } from 'antd';


const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const ClientBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, openContactsList, closeContactsList, isSelected, isHiddenAction, filteredItems } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'client',
            item: { clientId: item.id, filteredClients: filteredItems },
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
            <span>
                <TextCrop icon={false} title="Company" inputString={item.company} content={clientPopover(item)} />
            </span>
            {!isHiddenAction &&
                <div>
                    {
                        (item.contacts && item.contacts.length) ? (
                            !item.isHidedEmployees ? (
                                <CloseCircleOutlined style={{ pointerEvents: 'all' }} onClick={() => closeContactsList(item.id)} />
                            ) : (
                                <PlusCircleOutlined style={{ pointerEvents: 'all' }} onClick={() => openContactsList(item.id)} />
                            )
                        ) : (
                            <Tooltip title={item.contacts.length > 0 ? "" : "No contacts"}>
                                <PlusCircleOutlined disabled={true} style={{ pointerEvents: 'all' }} onClick={() => openContactsList(item.id)} />
                            </Tooltip>
                        )
                    }
                </div>
            }
        </li>
    );
}

export default ClientBadge;