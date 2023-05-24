import React from 'react'
import { useDrop } from "react-dnd";
import { connect } from 'react-redux';

const ProjectDropArea = (props) => {

    const [, projectDrop] = useDrop(
        () => ({
            accept: 'project',
            drop: (item, monitor) => props.onDrop(item)
        }),
        []
    );

    return (
        <div ref={projectDrop} className={props.className}>
            {props.children}
        </div>
    )
}

export default connect()(ProjectDropArea);