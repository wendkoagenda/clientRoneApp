import React from 'react'
import { useDrop } from "react-dnd";
import { connect } from 'react-redux';

const ClientDropArea = (props) => {

    const [, clientDrop] = useDrop(
        () => ({
            accept: 'client',
            drop: (item, monitor) => props.onDrop(item)
        }),
        []
    );

    return (
        <div ref={clientDrop} className={props.className}>
            {props.children}
        </div>
    )
}

export default connect()(ClientDropArea);