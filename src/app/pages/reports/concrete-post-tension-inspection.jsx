import React, { useEffect, useState } from 'react';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Form, notification, Row, Divider, Button, Tooltip } from 'antd';
import { strings } from '../../constants';
import { CustomInput } from '../../components/common';
import { useParams } from 'react-router';
import { ReportsService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';
import {
    calculatePercentElongation,
    calculateTotalElongation,
    calculateElongationSubtotal
} from '../../helpers/post-tension-calculation-helper'

const ConcretePostTenstionInspectionEditLayout = (props) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();

    const [reportForm] = Form.useForm();
    const [projectDataForm, setProjectDataForm] = useState({ projectSections: [] });
    const [reportData, setReportData] = useState(null);

    const LengthChangingProperties = [
        strings.REPORTS.PROPS_NAME.ELONGATION_FIRST,
        strings.REPORTS.PROPS_NAME.ELONGATION_SECOND,
        strings.REPORTS.PROPS_NAME.RESTRESS_ELONGATION,
        strings.REPORTS.PROPS_NAME.REQUIRED_ELONGATION,
    ]

    const handleCalculatedValueChange = (e, projectSectionNumber, propName, itemNumber) => {
        let result = 0
        switch (propName) {
            case strings.REPORTS.PROPS_NAME.ELONGATION_FIRST:
            case strings.REPORTS.PROPS_NAME.ELONGATION_SECOND:
                result = calculateElongationSubtotal(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].elongationFirst,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].elongationSecond
                );
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].elongationSubtotal = result;
                
                result = calculateTotalElongation(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].elongationSubtotal,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].restressElongation
                );
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].totalElongation = result;
                
                result = calculatePercentElongation(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].totalElongation,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].requiredElongation,
                )
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].percentElongation = result;
                break;

            case strings.REPORTS.PROPS_NAME.RESTRESS_ELONGATION:
                result = calculateTotalElongation(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].elongationSubtotal,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].restressElongation
                );
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].totalElongation = result;
                
                result = calculatePercentElongation(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].totalElongation,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].requiredElongation,
                )
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].percentElongation = result;
                break;

            case strings.REPORTS.PROPS_NAME.REQUIRED_ELONGATION:
                result = calculatePercentElongation(
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].totalElongation,
                    projectDataForm.projectSections[projectSectionNumber].items[itemNumber].requiredElongation,
                )
                projectDataForm.projectSections[projectSectionNumber].items[itemNumber].percentElongation = result;
                break;

            default:
                break;
        }
       
    }

    const initialReportForm = async () => {
        try {
            const reportResponse = await ReportsService.getReportById(dispatchRequestWorkOrderId);
            props.setEditingReport(reportResponse.data.data);
            if (reportResponse.status == 200) {
                const parsedData = populateCustomReportDataProperties(JSON.parse(reportResponse.data.data.jsonData));
                if (parsedData) {
                    setReportData(parsedData);
                    setProjectDataForm(parsedData);
                    reportForm.setFieldsValue(parsedData);
                }
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.LOAD_REPORTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    useEffect(() => {
        props.setGlobalSpinState(true);
        initialReportForm().then(() => {
            props.setGlobalSpinState(false);
        });
    }, [])

    const handleProjectDataChange = (e, projectSectionNumber, propName, isNumber, itemNumber = null) => {
        const updatedData = {
            projectSections: projectDataForm.projectSections.map((i, key) => {
                if (key == projectSectionNumber) {
                    if (itemNumber != null) {
                        i.items.forEach((item, itemKey) => {
                            if (itemKey == itemNumber) {
                                i.items[itemKey] = {
                                    ...item,
                                    [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null
                                }
                                if (LengthChangingProperties.includes(propName)) {
                                    handleCalculatedValueChange(e, projectSectionNumber, propName, itemNumber)
                                }
                            }
                        })
                        return i;
                    }
                    else {
                        return {
                            ...i,
                            [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null
                        }
                    }
                } else {
                    return i;
                }
            })
        }
        setProjectDataForm(updatedData);
        props.setEditingReportFormData(JSON.stringify(updatedData))
        reportForm.setFieldsValue(updatedData)
    }

    const handleFormSubmit = async () => {
        props.setGlobalSpinState(true);
        try {
            const updateProjectReportResponse = await ReportsService.updateWorkOrderReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId, jsonData: JSON.stringify(projectDataForm) });

            notification['success']({
                message: strings.COMMON.REPORT_SUBMIT_SUCCESS,
            });
        } catch (error) {
            TrackingService.trackException(error);
            props.setGlobalSpinState(false);
            const errorMessage = getErrorMessage(error, strings.COMMON.REPORT_UPDATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        props.setGlobalSpinState(false);
    }

    return (
        <div className="report-layout" style={{ flexDirection: 'column' }}>
            <Divider orientation="left">{strings.REPORTS.LABELS.CONCRETE_POST_TENSION_INSPECTION}</Divider>
            <Form style={{ width: '100%' }} form={reportForm}>
            {!!reportData &&
                (reportData.projectSections?.map((projectSection, key) => {
                    return (
                            <div className="set-block" key={key}>
                                <Divider orientation="left" style={{ marginBottom: '30px' }}>{strings.REPORTS.LABELS.PROJECT_DATA}</Divider>
                                <Row gutter={[48, 8]}>
                                    <Col span={8}>
                                        <CustomInput
                                            placeHolder={strings.REPORTS.LABELS.TENDON_DIAMETER}
                                            type="text"
                                            visible={true}
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.TENDON_DIAMETER]}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.TENDON_DIAMETER,
                                                true
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.SPECIFICATION_GRADE]}
                                            placeHolder={strings.REPORTS.LABELS.SPECIFICATION_GRADE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.SPECIFICATION_GRADE,
                                                true
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.REQUIRED_TENDON_FORCE]}
                                            placeHolder={strings.REPORTS.LABELS.REQUIRED_TENDON_FORCE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.REQUIRED_TENDON_FORCE,
                                                true
                                            )}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[48, 8]}>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.ALLOWABLE_TOLERANCE]}
                                            placeHolder={strings.REPORTS.LABELS.ALLOWABLE_TOLERANCE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.ALLOWABLE_TOLERANCE,
                                                true
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.LOCATION]}
                                            placeHolder={strings.REPORTS.LABELS.LOCATION}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.LOCATION)}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.TENDON_TYPE]}
                                            placeHolder={strings.REPORTS.LABELS.TENDON_TYPE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.TENDON_TYPE)}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[48, 8]}>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.RAM_NUMBER]}
                                            placeHolder={strings.REPORTS.LABELS.RAM_NUMBER}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.RAM_NUMBER
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.GAUGE_NUMBER]}
                                            placeHolder={strings.REPORTS.LABELS.GAUGE_NUMBER}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(
                                                e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.GAUGE_NUMBER,
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.CALIBRATION_DATE]}
                                            placeHolder={strings.REPORTS.LABELS.CALIBRATION_DATE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.CALIBRATION_DATE)}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[48, 8]}>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.GAUGE_PRESSURE]}
                                            placeHolder={strings.REPORTS.LABELS.GAUGE_PRESSURE}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e,
                                                key,
                                                strings.REPORTS.PROPS_NAME.GAUGE_PRESSURE,
                                                true
                                            )}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.BUILDING_NUMBER]}
                                            placeHolder={strings.REPORTS.LABELS.BUILDING_NUMBER}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.BUILDING_NUMBER)}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.POUR_NUMBER]}
                                            placeHolder={strings.REPORTS.LABELS.POUR_NUMBER}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.POUR_NUMBER)}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[48, 8]}>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.SAMPLE_TIME]}
                                            placeHolder={strings.REPORTS.LABELS.SAMPLE_TIME}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.SAMPLE_TIME)}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.BATCH_TIME]}
                                            placeHolder={strings.REPORTS.LABELS.BATCH_TIME}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.BATCH_TIME)}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[48, 16]}>
                                    <Col span={24}>
                                        <CustomInput
                                            name={["projectSections", key, strings.REPORTS.PROPS_NAME.COMMENTS_REMARKS]}
                                            placeHolder={strings.REPORTS.LABELS.COMMENTS_REMARKS}
                                            type="text"
                                            visible={true}
                                            onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.COMMENTS_REMARKS)}
                                        />
                                    </Col>
                                </Row>

                                {projectSection?.items?.map((item, itemKey) => {
                                    return (
                                        <div className="test-data" key={itemKey}>
                                            <Row>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.TENDON_ID]}
                                                        placeHolder={strings.REPORTS.LABELS.TENDON_ID}
                                                        type="text"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.TENDON_ID, false, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.REQUIRED_ELONGATION]}
                                                        placeHolder={strings.REPORTS.LABELS.REQUIRED_ELONGATION}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.REQUIRED_ELONGATION, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.PRESSURE_FIRST]}
                                                        placeHolder={strings.REPORTS.LABELS.PRESSURE_FIRST}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.PRESSURE_FIRST, true, itemKey)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.ELONGATION_FIRST]}
                                                        placeHolder={strings.REPORTS.LABELS.ELONGATION_FIRST}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.ELONGATION_FIRST, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.PRESSURE_SECOND]}
                                                        placeHolder={strings.REPORTS.LABELS.PRESSURE_SECOND}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.PRESSURE_SECOND, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.ELONGATION_SECOND]}
                                                        placeHolder={strings.REPORTS.LABELS.ELONGATION_SECOND}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.ELONGATION_SECOND, true, itemKey)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.ELONGATION_SUBTOTAL]}
                                                        placeHolder={strings.REPORTS.LABELS.ELONGATION_SUBTOTAL}
                                                        type="number"
                                                        visible={true}
                                                        disabled={true}
                                                        value={calculateElongationSubtotal(
                                                            item?.elongationFirst,
                                                            item?.elongationSecond
                                                        )}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.ELONGATION_SUBTOTAL, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.LIFT_OFF_PRESSURE]}
                                                        placeHolder={strings.REPORTS.LABELS.LIFT_OFF_PRESSURE}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.LIFT_OFF_PRESSURE, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.RESTRESS_PRESSURE]}
                                                        placeHolder={strings.REPORTS.LABELS.RESTRESS_PRESSURE}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.RESTRESS_PRESSURE, true, itemKey)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.RESTRESS_ELONGATION]}
                                                        placeHolder={strings.REPORTS.LABELS.RESTRESS_ELONGATION}
                                                        type="number"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.RESTRESS_ELONGATION, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.TOTAL_ELONGATION]}
                                                        placeHolder={strings.REPORTS.LABELS.TOTAL_ELONGATION}
                                                        type="number"
                                                        disabled={true}
                                                        visible={true}
                                                        value={calculateTotalElongation(
                                                            item?.elongationSubtotal,
                                                            item?.restressElongation
                                                        )}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.TOTAL_ELONGATION, true, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.PERCENT_ELONGATION]}
                                                        placeHolder={strings.REPORTS.LABELS.PERCENT_ELONGATION}
                                                        type="number"
                                                        disabled={true}
                                                        visible={true}
                                                        value={calculatePercentElongation(
                                                            item?.totalElongation,
                                                            item?.requiredElongation,
                                                        )}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.PERCENT_ELONGATION, true, itemKey)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={6}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.IN_TOLERANCE]}
                                                        placeHolder={strings.REPORTS.LABELS.IN_TOLERANCE}
                                                        type="text"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.IN_TOLERANCE, false, itemKey)}
                                                    />
                                                </Col>
                                                <Col span={14}>
                                                    <CustomInput
                                                        name={["projectSections", key, "items", itemKey, strings.REPORTS.PROPS_NAME.COMMENTS_REMARKS]}
                                                        placeHolder={strings.REPORTS.LABELS.COMMENTS_REMARKS}
                                                        type="text"
                                                        visible={true}
                                                        onInputChange={(e) => handleProjectDataChange(e, key, strings.REPORTS.PROPS_NAME.COMMENTS_REMARKS, false, itemKey)}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    )
                                })}

                            </div>
                    )
                }))
            }
            </Form>
            <Row justify="end">
                <Button onClick={handleFormSubmit} type="primary">
                    {strings.COMMON.SAVE}
                </Button>
            </Row>
        </div>
    )
}

const mapState = ({ reports }) => {
    return {
        report: reports.editingReport,
        reportTestsData: reports.reportTestsData
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setEditingReport(report) {
            dispatch(actions.setEditingReport(report));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setReportTestsData(values) {
            dispatch(actions.setReportTestsData(values));
        },
        setEditingReportFormData(value) {
            dispatch(actions.setEditingReportFormData(value));
        }
    }
}

export default connect(mapState, mapDispatch)(ConcretePostTenstionInspectionEditLayout);