import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { actions } from '../reports/reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Divider, Form, Row } from 'antd';
import { strings } from '../../constants';
import { CustomerPortalService } from '../../services';
import { CustomInput } from '../../components/common';

const CustomerSoilMoistureDensityRelationshipEditLayout = ({
    setEditingReport,
    setEditingReportFormData,
}) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [reportForm] = Form.useForm();

    useEffect(() => {
        CustomerPortalService.getReportById(dispatchRequestWorkOrderId).then(response => {
            const parsedData = JSON.parse(response?.data?.data?.jsonData);
            setEditingReport(response.data.data);
            if (parsedData) {
                reportForm.setFieldsValue(parsedData.projectSections[0]);
                setReportData(parsedData.projectSections[0]);
                reportForm.setFieldsValue({ chartStyle: parsedData.chartStyle })

                setEditingReportFormData(response?.data?.data?.jsonData);
            }
        })
    }, [dispatchRequestWorkOrderId, reportForm, setEditingReport, setEditingReportFormData])

    const getParsedReportData = async (validationRequired) => {
        let updateReportData = {};
        if (validationRequired) {
            updateReportData = await reportForm.validateFields();
        } else {
            updateReportData = reportForm.getFieldsValue();
        }

        return {
            chartStyle: updateReportData.chartStyle,
            projectSections: [
                {
                    ...updateReportData,
                    soilMoistureDensityRelationshipCalculations: {
                        ...updateReportData.soilMoistureDensityRelationshipCalculations,
                        projectSpecification: {
                            ...updateReportData.soilMoistureDensityRelationshipCalculations.projectSpecification,
                            liquidLimitCalculation: {
                                ...updateReportData.soilMoistureDensityRelationshipCalculations.projectSpecification.liquidLimitCalculation,
                                items: Object.keys(updateReportData.soilMoistureDensityRelationshipCalculations.projectSpecification.liquidLimitCalculation.items)
                                    .map(key => {
                                        const obj = updateReportData.soilMoistureDensityRelationshipCalculations.projectSpecification.liquidLimitCalculation.items[key];
                                        return {
                                            wetMaterialPlusTare: obj.wetMaterialPlusTare,
                                            dryMaterialPlusTare: obj.dryMaterialPlusTare,
                                            tare: obj.tare,
                                            numberOfBlows: obj.numberOfBlows,
                                        }
                                    })
                            }
                        },
                        chartSection: {
                            ...updateReportData.soilMoistureDensityRelationshipCalculations.chartSection,
                            items: Object.keys(updateReportData.soilMoistureDensityRelationshipCalculations.chartSection.items)
                                .map(key => {
                                    const obj = updateReportData.soilMoistureDensityRelationshipCalculations.chartSection.items[key];
                                    return {
                                        compactionTestCalculationItem: obj.compactionTestCalculationItem,
                                        moistureContentCalculationItem: obj.moistureContentCalculationItem,
                                        projectSpecificationsCalculationItem: obj.projectSpecificationsCalculationItem
                                    }
                                })
                        }
                    }
                }
            ]
        }
    }

    const onFormValuesChange = async () => {
        const parsedReportData = await getParsedReportData(false);
        setEditingReportFormData(JSON.stringify(parsedReportData));
    }

    return (
        <div className="report-layout soil-mdr-layout" style={{ flexDirection: 'column' }}>
            <Divider orientation="left">{strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY}</Divider>
            {
                !!reportData && (
                    <Form form={reportForm} onChange={onFormValuesChange}>
                        <Row>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Contractor" name="contractor" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true}  type="text" placeHolder="Classification" name="classification" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Initial Weight (Dry)" name="material" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Material Preparation" name="materialPreparation" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Date Sampled" name="dateSampled" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Rammer Type" name="rammerType" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Sample Location" name="sampleLocation" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Sampled By" name="sampledBy" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Test For" name="testFor" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Test Method" name="testMethod" />
                            </Col>
                        </Row>
                        <Divider orientation="left">Liquid Limit</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation?.items?.map((_, index) => (
                                <Row key={index}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Wet Material Plus Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${index}`, "wetMaterialPlusTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Dry Material Plus Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${index}`, "dryMaterialPlusTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${index}`, "tare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Number Of Blows"
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${index}`, "numberOfBlows"]} />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">Plastic Limit</Divider>
                        <Row>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeHolder="Wet Material Plus Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", "wetMaterialPlusTare"]} />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeHolder="Dry Material Plus Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", "dryMaterialPlusTare"]} />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeHolder="Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", "tare"]} />
                            </Col>
                        </Row>
                        <Divider orientation="left">Percent Pass Sieve</Divider>
                        <Row>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeHolder="Wet Material Plus Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", "wetMaterialPlusTare"]} />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeHolder="Dry Material Plus Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", "dryMaterialPlusTare"]} />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    defaultValue={0}
                                    placeHolder="Tare"
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", "tare"]} />
                            </Col>
                        </Row>
                        <Divider orientation="left">Compaction Test Calculations</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((_, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Wet Material Plus Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", "wetMaterialPlusTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Volume Conversion Factor"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", "volumeConversionFactor"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", "tare"]} />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">Moisture Content Calculations</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((_, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            type="text"
                                            placeHolder="Can Number"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "canNumber"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Wet Material Plus Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "wetMaterialPlusTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Dry Material Plus Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "dryMaterialPlusTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "tare"]} />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">Project Specifications Calculations</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((_, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Percent Of Water Added"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", "percentOfWaterAdded"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Material Mass"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", "materialMass"]} />
                                    </Col>
                                </Row>
                            ))
                        }
                    </Form>
                )
            }
        </div>
    );
};

const mapState = ({ reports }) => {
    return {
        report: reports.editingReport,
        reportTestsData: reports.reportTestsData
    };
}

const mapDispatch = (dispatch) => {
    return {
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setEditingReportFormData(value) {
            dispatch(actions.setEditingReportFormData(value));
        },
        setEditingReport(report) {
            dispatch(actions.setEditingReport(report));
        }
    }
}

export default connect(mapState, mapDispatch)(CustomerSoilMoistureDensityRelationshipEditLayout);