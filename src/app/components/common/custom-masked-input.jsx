import React, { useEffect, useState } from 'react';
import { Input, Form } from 'antd';
import MaskedInput from 'antd-mask-input';
import { CSSTransition } from 'react-transition-group';


const CustomMaskedInput = (props) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (props.value) {
            setVisible(true);
        }
    }, []);

    const handleChange = (event) => {
        if (props.onInputChange) {
            props.onInputChange(event);
        }

        if (props.placeHolder) {
            if (event.target.value == "") {
                setVisible(false);
            }
            else {
                setVisible(true);
            }
        }
    }

    return (
        <div className="custom-input">
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

            <Form.Item name={props.name} rules={props.rules}>
                <MaskedInput mask={props.inputMask}
                    placeholder={props.placeHolder}
                    disabled={props.disabled}
                    onChange={handleChange}
                />
            </Form.Item>
        </div>
    )
}

export default CustomMaskedInput;