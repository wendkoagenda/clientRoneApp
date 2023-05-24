import React from "react";
import { Tag } from "antd";

const ActionTag = (props) => {
    let color = "";

    switch (props.action) {
        case "Create":
            color = 'green';
            break;

        case "Update":
            color = 'gold';
            break;

        case "Delete":
            color = 'red';
            break;

        case "Restore":
            color = 'blue';
            break;

        default:
            break;
    }

    return (
        <Tag color={color}>{props.action.toUpperCase()}</Tag>
    )
}

export default ActionTag;