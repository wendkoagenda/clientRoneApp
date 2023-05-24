import React from 'react';
import { Select, Form } from 'antd';

const CustomSingleOptionSelect = (props) => {
    const { Option } = Select;

    return (
        <div className="custom-select">
            <Form.Item name={props.name} rules={props.rules}>
                <Select
                    showSearch
                    autoComplete="chrome-off"
                    ref={props.inputRef}
                    allowClear={props.allowClear}
                    value={props.value}
                    filterOption={(inputValue, option) =>
                        option.props.children
                            .toString()
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                    }
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                    style={{ width: '100%', ...props.style }}
                    onChange={props.handleChange}
                    defaultValue={props.defaultValue}
                    maxTagCount={props.maxTagCount}
                    mode={props.mode}
                    dropdownClassName={props.dropdownClassName}
                    onBlur={props.onBlur}
                    onPressEnter={props.onPressEnter}
                    getPopupContainer={trigger => props.triggerNode ? props.triggerNode : trigger.parentNode}
                >
                    {!!props.options &&
                        props.options.map(item => {
                            return (
                                <Option key={item.key} value={item.value}>{item.displayValue ? item.displayValue : item.value}</Option>
                            );
                        })
                    }
                </Select>
            </Form.Item>
        </div>
    );
};

export default CustomSingleOptionSelect;