import React from 'react';

const CropTooltipBody = (props) => {

    const { children, title } = props;
    
    return (
        <React.Fragment>
            {!!children && (
                <div className="tooltip-title">{title}</div>
            )}
            <div className="crop-text-body">{props.children}</div>
        </React.Fragment>
    )
}

export default CropTooltipBody;