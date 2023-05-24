import React from 'react';
import { Form, Input } from 'antd';

export const EditableCell = ({
    editing,
    dataIndex,
    _title,
    _inputType,
    _record,
    _index,
    children,
    ...restProps
}) => {
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                >
                    <Input type="number"/>
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};
