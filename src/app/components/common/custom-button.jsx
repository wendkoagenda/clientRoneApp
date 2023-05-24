import React from 'react';
import { Button } from 'antd';


const CustomBtn = (props) => {
    let buttonType = '';

    switch (props.type) {
        case 'primary':
            buttonType = 'custom-primary-btn';
            break;
        case 'search':
            buttonType = 'custom-search-btn';
            break;
        case 'default':
            buttonType = 'custom-default-btn';
            break;
        default:
            buttonType = 'custom-default-btn';
            break;
    }

    return (
        <div className={buttonType}>
            <Button icon={props.icon}
                onClick={props.onClick}
                style={props.style}
                htmlType={props.htmlType}
                className={props.className}
                loading={!!props.isLoading}
                disabled={!!props.disabled}
            >
                {props.name}
            </Button>
        </div>
    )
}

export default CustomBtn;