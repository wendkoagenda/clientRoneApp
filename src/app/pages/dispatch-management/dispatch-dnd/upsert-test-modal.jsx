import { Modal, Popconfirm, Form, Select, TimePicker} from "antd";
import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';
import { CustomBtn, CustomInput } from "../../../components/common";
import { strings } from "../../../constants";
import { actions } from '../dispatch-reducer';
import {
    MinusOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { isSoilMoistureDensityRelationshipReportType, isSoilReportType, moistureDensityInitialValue, isConcreteCoreOrSoilReportType, isCylindersBuildingConcreteType } from '../../../helpers/reportType-helper';
import { Option } from "antd/lib/mentions";
import {defaultCylinderSets} from "../../../constants"
import moment from "moment/moment";

const UpsertTestModal = (props) => {
    const {
        isModalVisible,
        handleOk,
        handleCancel,
        workOrderId,
        workOrderTypeId,
        managedDispatch
    } = props;

    const [testsForm] = Form.useForm();
    const [selectedSet, setSelectedSet] = useState(null); 
    const [selectedKey, setSelectedKey] = useState(null);

    useEffect(() => {
        const currentWorkOrder = managedDispatch.workOrders?.find(item => item.id == workOrderId);
        if (currentWorkOrder) {
            let currentTests = isSoilReportType(workOrderTypeId) ? currentWorkOrder.dispatchRequestWorkOrderSoilTests : currentWorkOrder.dispatchRequestWorkOrderConcreteTests;
            const groupedBySet = {
                    dispatchRequestWorkOrderConcreteTests: Object.values(_.groupBy(currentTests, item => item.setNumber))?.map(item => {
                        return {
                            tests: item.map(test => {
                                return {
                                    ...test,
                                    expectedResultHours: moment().hours((test.expectedResultHours)),
                                    setNumber: test.setNumber - 1
                                }
                            })
                        }
                    })
                }

            if(currentTests)
                { 
                    testsForm.setFieldsValue(isSoilMoistureDensityRelationshipReportType(workOrderTypeId) 
                            ? moistureDensityInitialValue 
                            : groupedBySet
                );}
            else
                {
                    testsForm.setFieldsValue({
                        dispatchRequestWorkOrderConcreteTests: [
                            {
                                "tests": [
                                    {
                                        "expectedResultDays": 0,
                                        "expectedResultHours": moment("0"),
                                    }
                                ],
                            }
                        ]
                    })
                }
        }
        return () => {
           testsForm.resetFields();
        }
    }, [managedDispatch.workOrders, testsForm, workOrderId, workOrderTypeId])

    useEffect(() => {     
        if (!selectedSet) return;
        const fields = testsForm.getFieldsValue();
        let { dispatchRequestWorkOrderConcreteTests } = fields;
        dispatchRequestWorkOrderConcreteTests = dispatchRequestWorkOrderConcreteTests ? dispatchRequestWorkOrderConcreteTests : [];
        dispatchRequestWorkOrderConcreteTests[selectedKey] = { 
            tests: selectedSet?.specimens.map(x => x)
        }
        testsForm.setFieldsValue(fields);
        setSelectedSet(null)
    }
    ), [selectedSet, selectedKey]
    
    const onSelect = (e,key) => {
        setSelectedKey(key)
        setSelectedSet(defaultCylinderSets[defaultCylinderSets.filter(set => set.name === e)[0].id])
    }

    const handleSubmit = async () => {
        const concreteTests = await testsForm.validateFields(); 
        const parsedConcreteTests = concreteTests.dispatchRequestWorkOrderConcreteTests?.map((item, index) => {
            return item.tests.map(test => {
                return {
                    ...test,
                    expectedResultHours: test.expectedResultHours 
                        ? test.expectedResultHours.hours()
                        : 0,
                    setNumber: index + 1
                }
            })
        }).flat(1)

        props.setWorkOrdersTests(workOrderId, parsedConcreteTests, workOrderTypeId);

        handleCancel();
    }

    const footerElement = (
        <Popconfirm
            title={strings.COMMON.SAVE_CHANGES_CONFIRM}
            onConfirm={handleSubmit}
            okText={strings.COMMON.OK}
            cancelText={strings.COMMON.CANCEL}
            placement='right'
        >
            <CustomBtn type="primary" name={strings.COMMON.SUBMIT} />
        </Popconfirm>
    );

    const plusButton = (label, func) => {
        return (
            <div className="plus-btn-wrapper" style={{ cursor: isSoilMoistureDensityRelationshipReportType(workOrderTypeId) && 'not-allowed' }}>
                <PlusOutlined className="add-blocks-btn" onClick={func} style={{ pointerEvents: isSoilMoistureDensityRelationshipReportType(workOrderTypeId) && 'none' }} />
                <p>{label}</p>
            </div>
        )
    }

    const minusButton = (func) => {
        return (
            <div className="minus-btn-wrapper" style={{ cursor: isSoilMoistureDensityRelationshipReportType(workOrderTypeId) && 'not-allowed' }}>
                <MinusOutlined className="minus-blocks-btn" onClick={func} style={{ pointerEvents: isSoilMoistureDensityRelationshipReportType(workOrderTypeId) && 'none' }} />
            </div>
        )
    }

    return (
        <Modal
            destroyOnClose={true}
            title={strings.COMMON.SETUP_TESTS}
            visible={isModalVisible}
            onCancel={handleCancel}
            onOk={handleOk}
            wrapClassName="tests-modal"
            footer={[footerElement]}
        >
            {
                <Form form={testsForm} >
                    <Form.List name="dispatchRequestWorkOrderConcreteTests">
                        {(fields, { add, remove }) => (
                            <>            
                                {plusButton(strings.COMMON.ADD_SET, () => add())}
                                {fields.map(item => {
                                    return (
                                        <div className="tests-block-wrapper" key={item.key}>
                                            <div className="tests-block">
                                                <Form.List name={[item.name, 'tests']} initialValue={[{}]}>
                                                    {(inputs, { add, remove }) => (                     
                                                        <>
                                                            <div className="add-options-wrapper">
                                                                {plusButton(strings.COMMON.ADD_SPECIMEN, () => add())}
                                                                {isCylindersBuildingConcreteType(workOrderTypeId) && <Select placeholder={strings.COMMON.ADD_DEFAULT_TESTS_PLACEHOLDER}
                                                                    className="select"
                                                                    onSelect={e => onSelect(e, item.key)}
                                                                    value={[]}
                                                                    getPopupContainer={trigger => trigger.parentNode}
                                                                    bordered={false}
                                                                >
                                                                    {defaultCylinderSets.map(set =>
                                                                        <Option key={set.name}>
                                                                            {set.name}
                                                                        </Option>
                                                                    )}
                                                                </Select>
                                                                }
                                                            </div>
                                                            {inputs.map(input => {
                                                                return (
                                                                    <div className="test-block" key={input.key}>
                                                                        <div className="specimen-block" id="specimen-block-id">
                                                                            <CustomInput
                                                                                name={[input.name, 'expectedResultDays']}
                                                                                placeHolder={strings.COMMON.DAYS_VALUE}
                                                                                type='number'
                                                                                normalize={(e) => Number(e)}
                                                                                formItemProps={input}
                                                                                initialValue={0}
                                                                                disabled={isConcreteCoreOrSoilReportType(workOrderTypeId)}
                                                                                visible={true}
                                                                            />
                                                                            {!isConcreteCoreOrSoilReportType(workOrderTypeId) &&
                                                                                <React.Fragment>
                                                                                    <small className="custom-input-label">{strings.COMMON.HOURS_VALUE}</small>
                                                                                    <Form.Item name={[input.name, 'expectedResultHours']} initialValue={moment("0")} formItemProps={input}>
                                                                                        <TimePicker
                                                                                            className="hours-picker"
                                                                                            format={"HH"}
                                                                                            bordered={false}
                                                                                            placeholder={strings.COMMON.HOURS_VALUE}
                                                                                            showNow={false}
                                                                                            getPopupContainer={_ => document.getElementById('specimen-block-id')}
                                                                                        />
                                                                                    </Form.Item>
                                                                                </React.Fragment>
                                                                            }
                                                                        </div>
                                                                        {minusButton(() => remove(input.name))}
                                                                    </div>                         
                                                                )
                                                            })}
                                                        </>
                                                    )}
                                                </Form.List>
                                            </div>
                                            {minusButton(() => remove(item.name))}
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </Form.List>
                </Form>     
            }
        </Modal>
    )
}

const mapState = ({ dispatch }) => {
    return {
        editingStatus: dispatch.editingStatus,
        editingDispatch: dispatch.editingDispatch,
        managedDispatch: dispatch.managedDispatch
    };
}

const mapDispatch = (dispatch) => {
    return {
        setWorkOrdersTests(id, values, workOrderTypeId) {
            dispatch(actions.setWorkOrdersTests(id, values, workOrderTypeId));
        }
    }
}

export default connect(mapState, mapDispatch)(UpsertTestModal);