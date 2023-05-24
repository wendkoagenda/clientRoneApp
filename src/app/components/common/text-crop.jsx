import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import CropTooltipBody from './crop-tooltip-body';

const { Text } = Typography;

const TextCrop = (props) => {
    const [inputStr, setInputStr] = useState();

    useEffect(() => {
        if (props.inputString) {
            setInputStr(typeof props.inputString === 'string' ? props.inputString : props.inputString.toString());
        }
    }, [props.inputString])

    return (
        <>
            {!!props.icon && (
                props.icon
            )}
            {!inputStr
                ? <p className="col-text"></p>
                : (
                    <Text
                        className="col-text"
                        style={props.style}
                        ellipsis={{ tooltip: !props.isTooltipDisabled && <CropTooltipBody title={props.title}>{props.content ? props.content : inputStr}</CropTooltipBody> }}>
                        {inputStr}
                    </Text>
                )
            }
        </>
    );
};

export default TextCrop;