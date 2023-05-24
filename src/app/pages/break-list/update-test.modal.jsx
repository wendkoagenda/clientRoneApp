import { Col, Modal, Row, Form, Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { CustomInput, CustomSingleOptionSelect } from '../../components/common';
import { reportProps, strings } from '../../constants';
import { actions } from './break-list.reducer';
import { connect } from 'react-redux';
import BreakListService from '../../services/break-list.service';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { GRAPH_COORDINATES } from '../../constants/report-props';
import {
    MinusOutlined,
    PlusOutlined
} from '@ant-design/icons';
import reportTypesIds, { reportTypesGroup } from '../../constants/report-types';
import { calculateArea, calculateCompressiveStrength, calculateDryDensity } from "../../helpers/math-helper";
import { fractureTypeSelectOptions } from '../../constants/fractureTypes';
import { positiveNumberRule } from '../../helpers/validation-rules';
import {
    calculateLiquidLimit,
    calculateMoistureContent,
    calculatePercentPass,
    calculatePlasticityIndex,
    calculatePlasticLimit
} from '../../helpers/moisture-density-relationship-reports-calculations-helper';
import moment from 'moment';

const EditTestModal = (props) => {
    const [isEditModalButtonLoading, setEditModalButtonLoading] = useState(false);
    const [specInfo] = Form.useForm();
    const [updatedFields, setUpdatedFields] = useState({
        diameter: 0,
        maximumLoad: 0,
        area: 0,
    });

    const { editModalVisible, handleOk, handleCancel, reportTypeGroup, reportType, isSearchDate, userNameSelectOptions } = props;

    useEffect(() => {
        if (editModalVisible.record) {
            specInfo.setFieldsValue({
                ...editModalVisible.record,
                fracture: editModalVisible.record.fractureType,
            });
        }
    }, [editModalVisible.record, specInfo])

    const handleEditSpecInfo = async () => {
        setEditModalButtonLoading(true);
        try {
            const newValues = await specInfo.validateFields();
            let editSpecResponse;

            switch (reportTypeGroup) {
                case reportTypesGroup.CONCRETE:
                    editSpecResponse = await BreakListService.updateConcreteSpecInfo({
                        barcode: editModalVisible.record.barcode,
                        ...newValues
                    });
                    break;

                case reportTypesGroup.SOIL:
                    let model = {...newValues}; 
                    if (reportType == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP || reportType == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E) {

                        let moistureContent = calculateMoistureContent(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare);
                        let liquidLimit = calculateLiquidLimit(moistureContent, newValues?.noOfBlows);
                        let plasticLimit = calculatePlasticLimit(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare);
                        let plasticityIndex = calculatePlasticityIndex(liquidLimit, plasticLimit);
                        let passing = calculatePercentPass(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare);
                        const CalculatedWrong = isNaN(plasticityIndex) || isNaN(liquidLimit) || isNaN(plasticLimit) || isNaN(passing);

                        let { wetMaterialTare, dryMaterialTare, tare, noOfBlows, ...rest } = newValues;
                        model = rest;
                        if (!CalculatedWrong) {
                            console.log("model")
                             model = {
                                ...model,
                                passing: passing,
                                liquidLimit: liquidLimit,
                                plasticLimit: plasticLimit,
                                plasticityIndex: plasticityIndex
                            }
                        }                   
                    }
                    editSpecResponse = await BreakListService.updateSoilSpecInfo([{
                        barcode: editModalVisible.record.barcode,
                        ...model
                    }]);
                    break;

                default:
                    break;
            }

            if (editSpecResponse.status == 200) {
                handleOk();
                notification['success']({
                    message: strings.BREAK_LIST.LABELS.UPDATED_SPEC
                });

                if (isSearchDate) {
                    props.updateSpecInfoWithoutPagination(editModalVisible.record.breakListItemId, newValues);
                } else {
                    props.updateSpecInfo(editModalVisible.record.breakListItemId, newValues);
                }
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
        setEditModalButtonLoading(false);
    }

    const handleDiameterOrMaximumLoadChange = (value, propName, isNumber) => {
        if (propName === strings.REPORTS.PROPS_NAME.DIAMETER) {
            var newArea = value ? calculateArea(value) : null;
            setUpdatedFields(prev => ({
                ...prev, 
                diameter: value,
                area: newArea
            }));
            specInfo.setFieldsValue({
                ...editModalVisible.record,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                area: newArea,
                compressiveStrength: editModalVisible.record.maximumLoad ? calculateCompressiveStrength(updatedFields.maximumLoad ? updatedFields.maximumLoad : editModalVisible?.record.maximumLoad, newArea) : null,
                maximumLoad: updatedFields.maximumLoad ? updatedFields.maximumLoad : editModalVisible?.record.maximumLoad
            })
        } else {
            setUpdatedFields(prev => ({
                ...prev,
                maximumLoad: value
            }));
            specInfo.setFieldsValue({
                ...editModalVisible.record,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                area: updatedFields.area ? updatedFields.area : editModalVisible.record.area,
                compressiveStrength: editModalVisible.record.area ? calculateCompressiveStrength(value ? value : updatedFields.maximumLoad, updatedFields.area ? updatedFields.area : editModalVisible.record.area) : null,
                diameter: updatedFields.diameter ? updatedFields.diameter : editModalVisible?.record.diameter
            })
        }
    }

    const handleBreakDateChange = (value) => {
        setUpdatedFields(prev => ({
            ...prev,
            breakDate: moment(value).format("MM/DD/YYYY")
        }))
    }

    const handleMoistureOrWetDensityChange = (value, propName, isNumber) => {
        if (propName === strings.REPORTS.PROPS_NAME.MOISTURE) {
            specInfo.setFieldsValue({
                ...editModalVisible.record,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(value), Number(editModalVisible.record?.wetDensity))
            })
        } else {
            specInfo.setFieldsValue({
                ...editModalVisible.record,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(editModalVisible.record?.moisture), Number(value))
            })
        }
    }
    const handleSoilMoistureFieldChange = async (value, propName, isNumber) => {
        const newValues = await specInfo.validateFields();
        let moistureContent = calculateMoistureContent(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare);
        let liquidLimit = calculateLiquidLimit(moistureContent, newValues?.noOfBlows);
        let plasticLimit = calculatePlasticLimit(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare);
        let plasticityIndex = calculatePlasticityIndex(liquidLimit, plasticLimit);
        let passing = calculatePercentPass(newValues?.wetMaterialTare, newValues?.dryMaterialTare, newValues?.tare)
    
        const CalculatedWrong = isNaN(plasticityIndex) || isNaN(liquidLimit) || isNaN(plasticLimit) || isNaN(passing);
        if(!CalculatedWrong) {
            specInfo.setFieldsValue({
                ...editModalVisible.record,
               [propName]: value ? (isNumber ? Number(value) : value) : null,
                liquidLimit: liquidLimit,
                plasticLimit: plasticLimit,
                plasticityIndex: plasticityIndex,
                passing: passing
            })
        }
    }
    return (
        <Modal
            title={strings.BREAK_LIST.LABELS.UPDATE_SPEC}
            destroyOnClose={true}
            afterClose={() => specInfo.resetFields()}
            visible={editModalVisible.visible}
            onCancel={handleCancel}
            wrapClassName="edit-test-modal"
            footer={[
                // eslint-disable-next-line react/jsx-key
                <Button loading={isEditModalButtonLoading} onClick={handleEditSpecInfo} type="primary">
                    {strings.COMMON.SUBMIT}
                </Button>
            ]}
        >
            <Form form={specInfo} name="spec-info-form">
                {
                    reportProps[props.reportType]?.map(item => {
                        if (item.isEditable) {
                            if (item.dataIndex === GRAPH_COORDINATES.dataIndex) {
                                return (
                                    <Form.List key={item.sorterProp} name={GRAPH_COORDINATES.dataIndex} initialValue={editModalVisible.record?.graphCoordinates}>
                                         {(fields, { add, remove }) => (
                                            <>
                                                <div className="form-list-label">
                                                    <p>{GRAPH_COORDINATES.name}</p>
                                                    <PlusOutlined onClick={() => add()} />
                                                </div>
                                                {fields.map(item => {
                                                    return (
                                                        <div className="graphs-block" key={item.key}>
                                                            <div style={{ width: '80%' }}>
                                                                <CustomInput
                                                                    name={[item.name, strings.BREAK_LIST.LABELS.DRY_DENSITY]}
                                                                    placeHolder={strings.BREAK_LIST.PLACEHOLDERS.DRY_DENSITY}
                                                                    type='number'
                                                                    normalize={(e) => Number(e)}
                                                                    formItemProps={item}
                                                                    defaultFocused={true}
                                                                />
                                                                <CustomInput
                                                                    name={[item.name, strings.BREAK_LIST.LABELS.MOISTURE_CONTENT]}
                                                                    placeHolder={strings.BREAK_LIST.PLACEHOLDERS.MOISTURE_CONTENT}
                                                                    type='number'
                                                                    normalize={(e) => Number(e)}
                                                                    formItemProps={item}
                                                                    defaultFocused={true}
                                                                />
                                                            </div>
                                                            <MinusOutlined onClick={() => remove(item.name)} />
                                                        </div>
                                                    )
                                                })}
                                            </>
                                        )}
                                    </Form.List>
                                )
                            } else {
                                return (
                                    <Row key={item.name}>
                                        <Col span={24}>
                                            {
                                                ((item.name === strings.BREAK_LIST.LABELS.FRACTURE && reportType === reportTypesIds.CONCRETE_CYLINDERS) || item.name === strings.BREAK_LIST.LABELS.TESTED_BY)
                                                    ? <CustomSingleOptionSelect
                                                        name={item.sorterProp}
                                                        value={item.name === strings.BREAK_LIST.LABELS.TESTED_BY ? editModalVisible.record?.testedBy : editModalVisible.record?.fractureType}
                                                        placeholder={item.name}
                                                        options={item.name === strings.BREAK_LIST.LABELS.TESTED_BY ? userNameSelectOptions : fractureTypeSelectOptions}
                                                    />
                                                    : <CustomInput
                                                        rules={reportTypeGroup === reportTypesGroup.CONCRETE && item.isNumber
                                                            ? positiveNumberRule
                                                            : null}
                                                        defaultFocused={true}
                                                        name={item.dataIndex}
                                                        placeHolder={item.name}
                                                        type={ item.isDate ? 'date' : item.isNumber ? 'number' : 'text'}
                                                        onInputChange={
                                                            (e) => item.name === strings.BREAK_LIST.LABELS.DIAMETER || item.name === strings.BREAK_LIST.LABELS.MAXIMUM_LOAD && reportType === reportTypesIds.CONCRETE_CYLINDERS
                                                                ? handleDiameterOrMaximumLoadChange(Number(e.target.value), item.dataIndex, true)
                                                                : item.name === strings.BREAK_LIST.LABELS.MOISTURE || item.name === strings.BREAK_LIST.LABELS.WET_DENSITY && reportType === reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING
                                                                    ? handleMoistureOrWetDensityChange(e.target.value, item.dataIndex, true)
                                                                    : reportType === reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP || reportType === reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E 
                                                                        ? handleSoilMoistureFieldChange(e.target.value, item.dataIndex, true)
                                                                        : item.name === strings.BREAK_LIST.LABELS.BREAK_DATE  && reportType === reportTypesIds.CONCRETE_CYLINDERS
                                                                            ? handleBreakDateChange(e.target.value, item.dataIndex)
                                                                            : null
                                                        }
                                                        
                                                    />
                                            }
                                        </Col>
                                    </Row>
                                )
                            }
                        } else {
                            if(item.dataIndex == strings.REPORTS.PROPS_NAME.PLASTIC_LIMIT || item.dataIndex == strings.REPORTS.PROPS_NAME.LIQUID_LIMIT ||
                               item.dataIndex == strings.REPORTS.PROPS_NAME.PLASTICITY_INDEX || item.dataIndex == strings.REPORTS.PROPS_NAME.PASSING)
                            return (
                                <Row key={item.name}>
                                    <Col span={24}>
                                            <CustomInput
                                                    defaultFocused={true}
                                                    name={item.dataIndex}
                                                    placeHolder={item.name}
                                                    type={item.isNumber ? 'number' : 'text'}
                                                    normalize={item.isNumber && ((e) => Number(e).toFixed(2))}
                                                    disabled={true}
                                                />
                                    </Col>
                                </Row>
                            )
                        }
                    })
                }
            </Form>
        </Modal>
    )
}

const mapState = ({ breakList }) => {
    return {
        reportType: breakList.reportTypeId,
        reportTypeGroup: breakList.reportTypeGroup
    };
}

const mapDispatch = (dispatch) => {
    return {
        updateSpecInfo(id, values) {
            dispatch(actions.updateSpecInfo(id, values));
        },
        updateSpecInfoWithoutPagination(id, values) {
            dispatch(actions.updateSpecInfoWithoutPagination(id, values));
        }
    }
}

export default connect(mapState, mapDispatch)(EditTestModal);