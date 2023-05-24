import React from 'react';
import { Typography } from 'antd';
import CropTooltipBody from './crop-tooltip-body';

const { Text } = Typography;

const TextCropCell = (props) => {
    return (
        <div className="info-col" onClick={props.onClick}>
            {!!props.icon && (
                props.icon
            )}
            {!props.inputString
                ? <p className={`col-text ${props.className}`}></p>
                : (
                    <Text
                        className={`col-text ${props.className}`}
                        ellipsis={{ tooltip: <CropTooltipBody title={props.title}>{props.content ? props.content : props.inputString}</CropTooltipBody> }}>
                        {props.inputString}
                    </Text>
                )
            }
        </div>
    );
};

export default TextCropCell;