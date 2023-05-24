import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { actions } from '../reports/reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Divider, Form, Row } from 'antd';
import { strings } from '../../constants';
import { CustomerPortalService } from '../../services';
import { CustomInput} from '../../components/common';

const CustomerSoilMoistureDensityRelationshipMethodBEditLayout = ({
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


    return (
        <div className="report-layout soil-mdr-layout" style={{ flexDirection: 'column' }}>
            <Divider orientation="left">{strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY}</Divider>
            {
                !!reportData && (
                    <Form form={reportForm}>
                        <Row>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Contractor" name="contractor" />
                            </Col>
                            <Col span={6}>
                                <CustomInput disabled={true} type="text" placeHolder="Classification" name="classification" />
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
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    placeholder={strings.REPORTS.LABELS.TESTED_BY}
                                    dropdownClassName="report-type-dropdown"
                                    name="testedBy"
                                />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    disabled={true}
                                    type="text"
                                    placeHolder="Chart style, 'r' - regular, 's' - smooth [default]"
                                    name="chartStyle" />
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
                        <Divider />
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((_, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Height Of Material"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "heightOfMaterial"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Volume Of Mold"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "volumeOfMold"]} />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">Compaction Test Calculations</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((_, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Wet Material Plus Mold Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", "wetMaterialPlusMoldTare"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Mold Tare"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", "moldTare"]} />
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
                                            placeHolder="Wet Mass Pan And Material"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "wetMassPanAndMaterial"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Dry Mass Pan And Material"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "dryMassPanAndMaterial"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Pan Tare Mass"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", "panTareMass"]} />
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
                                            placeHolder="Total Percent Water"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", "totalPercentWater"]} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInput
                                            disabled={true}
                                            placeHolder="Materials"
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", "materials"]} />
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

export default connect(mapState, mapDispatch)(CustomerSoilMoistureDensityRelationshipMethodBEditLayout);