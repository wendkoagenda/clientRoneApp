import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { Popover } from 'antd';


const selectedStyle = {
    border: '2px dashed rgb(220, 220, 220)',
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const ProjectBadge = (props) => {
    const [isDragging, setDragging] = useState(false);
    const { item, openContactsList, closeContactsList, isSelected, filteredItems, filteredClients } = props;

    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: 'project',
            item: { projectId: item.id, filteredProjects: filteredItems, filteredClients: filteredClients },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
            })
        }),
        []
    )

    const projectPopover = (project) => {
        return (
            <div className="details-popover">
                <p>Name: <span>{project.name}</span></p>
                <p>Number: <span>{project.number}</span></p>
                <p>Address: <span>{project.address}</span></p>
                <p>City: <span>{project.city}</span></p>
                <p>ZIP: <span>{project.zipCode}</span></p>
                <p>Country: <span>{project.country}</span></p>
            </div>
        )
    }

    return (
        <li ref={dragRef} style={(isSelected || isDragging) ? selectedStyle : { borderColor: '#dae9ff' }} className="clients-list-item ant-list-item">
            <Popover content={() => projectPopover(item)}>
                <span>{item.name}</span>
            </Popover>
        </li>
    );
}

export default ProjectBadge;