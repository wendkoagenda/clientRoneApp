import React, { useEffect, useState } from 'react';
import { Form, InputNumber } from 'antd';
import { CSSTransition } from 'react-transition-group';


const CustomInputNumber = (props) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (props.value || props.defaultValue || props.defaultFocused) {
            setVisible(true);
        }
    }, []);

    const handleChange = (event) => {
        if (props.onInputChange) {
            props.onInputChange(event);
        }

        if (props.placeHolder) {
            if (!event) {
                setVisible(false);
            }
            else {
                setVisible(true);
            }
        }
    }

    return (
        <div className="custom-input" style={props.style}>
            <CSSTransition
                in={visible}
                timeout={400}
                onChange={props.onChange}
                classNames="input-label"
                unmountOnExit>
                <>
                    {!!props.placeHolder && <small className="custom-input-label">{props.placeHolder}</small>}
                </>
            </CSSTransition>

            <Form.Item {...props.formItemProps} name={props.name} rules={props.rules} initialValue={props.initialValue} normalize={props.normalize}>
                <InputNumber placeholder={props.placeHolder}
                    defaultValue={props.defaultValue}
                    value={props.value}
                    ref={props.inputRef}
                    disabled={props.disabled}
                    onChange={handleChange}
                    onBlur={props.onBlur}
                />
            </Form.Item>
        </div>
    )
}

export default CustomInputNumber;