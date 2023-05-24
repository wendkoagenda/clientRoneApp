import React, { useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Select, Form, Tag, Divider, Checkbox } from 'antd';
import strings from '../../constants/strings';

const { Option } = Select;

const tagStyle = {
    margin: 2,
    height: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '500'
}

const CustomSelect = (props) => {
    const [labelVisible, setLabelVisible] = useState(false);
    const [selectedOptions, setSelected] = useState([]);
    const [checked, setChecked] = useState(false);
    const inputRef = useRef(null);

    const items = props.children;
    const children = [];
    let sitesId = [];

    if (Array.isArray(items)) {
        sitesId = items.map(i => i.id);
    }

    const selectAll = (e) => {
        if (e.target.checked) {
            props.setFields([{ name: props.name, value: sitesId }]);
            setSelected(sitesId);
        }
        else {
            props.setFields([{ name: props.name, value: [] }]);
            setSelected([]);
        }
    }

    const handleChange = (value) => {
        if (props.placeHolder) {
            if (value.length == 0) {
                setLabelVisible(false);
            }
            else {
                setLabelVisible(true);
            }
        }

        if (props.mode) {
            if (value.length != sitesId.length) {
                inputRef.current.state.checked = false;
            }
            else {
                inputRef.current.state.checked = true;
            }
        }

        setSelected(value);

        props.handleChange(value);
    }

    const renderSiteTag = (tagProps) => {
        const { value, closable, onClose } = tagProps;
        if (value && value !== 'all') {
            const siteName = props.sites.find(item => item.id == value);

            return (
                <Tag
                    closable={closable}
                    onClose={onClose}
                    style={tagStyle}
                >
                    {siteName.name}
                </Tag>
            );
        }
    }

    if (props.keys) {
        Object.keys(items).map(key => children.push(
            <Option key={items[key].id}>{items[key].name}</Option>
        )
        );
    }
    else {
        Object.keys(items).map(key => children.push(
            <Option key={items[key]}>{items[key]}</Option>
        )
        );
    }

    const setInitialValues = (values) => {
        if (values && values.length == sitesId.length) {
            setChecked(true);
        }

        setSelected(values);
    }

    const dropDownStyle = !!props.mode &&
        <><div className="select-all-option">
            <Checkbox ref={inputRef} onChange={selectAll} defaultChecked={checked}>{strings.COMMON.SELECT_ALL}</Checkbox>
        </div>
            <Divider style={{ margin: '4px 0' }} /></>;


    return (
        <div className="custom-select">
            <CSSTransition
                in={labelVisible}
                timeout={400}
                onChange={props.onChange}
                classNames="input-label"
                unmountOnExit>
                <>
                    {!!props.placeHolder && <small className="custom-input-label">{props.placeHolder}</small>}
                </>
            </CSSTransition>
            <Form.Item name={props.name} rules={props.rules} getValueProps={(e) => setInitialValues(e)}>
                <Select
                    mode={props.mode}
                    allowClear
                    onClear={() => setLabelVisible(false)}
                    showArrow={true}
                    style={{ width: '100%', ...props.style }}
                    placeholder={props.placeHolder}
                    value={selectedOptions}
                    tagRender={(props.name === 'sites' && props.children && props.children.length) ? (tagProps) => renderSiteTag(tagProps) : null}
                    onChange={handleChange}
                    dropdownRender={menu => (
                        <>
                            {dropDownStyle}
                            {menu}
                        </>
                    )}
                >
                    {children.filter((item) => {
                        if (Array.isArray(selectedOptions)) {
                            return !(selectedOptions.some(key => key == item.key));
                        }
                        else {
                            return !(selectedOptions == item.key)
                        }
                    })}
                </Select>
            </Form.Item>
        </div>
    )
}

export default CustomSelect;