import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import TextCrop from '../../../components/common/text-crop';
import { Popover } from 'antd';

const ProjectBadge = (props) => {
    
   const { item, isSelected } = props;
   const [isDragging, setDragging] = useState(false);
   const [{ opacity }, dragRef] = useDrag(
    () => ({
        type: 'project',
        item: { projectId: item?.id },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? setDragging(true) : setDragging(false),
        })
    }),
    []
);

const projectPopover = (item) => {
    return (
        <div className="details-popover">
            <p>Id: <span>{item.id}</span></p>
            <p>Name: <span>{item.name}</span></p>
            <p>Address: <span>{item.address}</span></p>
            <p>City: <span>{item.city}</span></p>
        </div>
    );
};

const projectMark = (item) => {
    return (
        <Popover overlayStyle={{  fontSize: '16px' }} content={projectPopover(item)} title={item.name}>
            <div className="mark-dot" />
        </Popover>
    );
};

 return (
         <li ref={dragRef} className={(isSelected || isDragging) ? "ant-list-item selected" : "ant-list-item"}>
           {projectMark(item)}
           <TextCrop icon={false} title="Project" inputString={item.name} content={projectPopover(item)} />
        </li>
    );
}

export default ProjectBadge;