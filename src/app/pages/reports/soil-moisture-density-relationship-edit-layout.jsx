import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Button, Col, Divider, Form, notification, Row, Switch } from 'antd';
import { strings } from '../../constants';
import { ReportsService, TrackingService, UserManagement } from '../../services';
import { CustomInput, CustomInputNumber, CustomSingleOptionSelect } from '../../components/common';
import { getErrorMessage } from '../../services/tracking.service';
import {
    calculateAdmixtureMass,
    calculateAverageValue,
    calculateDryDensityPcf,
    calculateDryMaterial,
    calculateLiquidLimit,
    calculateMoistureContent,
    calculateMoistureContentPercent,
    calculatePercentPass,
    calculatePlasticityIndex,
    calculatePlasticLimit,
    calculateWater,
    calculateWaterAdded,
    calculateWetDensityOfSpecimen,
    calculateWetMaterial,
    calculateZeroVoidsPoint,
    calculateMoistureContentPercentWithCorrection,
    calculateDryDensityPcfWithCorrection
} from '../../helpers/moisture-density-relationship-reports-calculations-helper';

const SoilMoistureDensityRelationshipEditLayout = ({
    setEditingReport,
    setEditingReportFormData,
    setGlobalSpinState,
    isReportItemLayout
}) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [userNameSelectOptions, setUserNameSelectOptions] = useState([]);
    const [reportForm] = Form.useForm();
    const [isCorrectionSelected, setIsCorrectionSelected] = useState(false);
    const liquidLimits = [];

    useEffect(() => {
        ReportsService.getReportById(dispatchRequestWorkOrderId).then(response => {
            const parsedData = JSON.parse(response?.data?.data?.jsonData);
            setEditingReport(response.data.data);
            if (parsedData) {
                reportForm.setFieldsValue(parsedData.projectSections[0]);
                setReportData(parsedData.projectSections[0]);
                reportForm.setFieldsValue({ chartStyle: parsedData.chartStyle })
                reportForm.setFieldsValue({ specificGravity: parsedData.specificGravity })
                setIsCorrectionSelected(
                    parsedData?.projectSections[0]?.useOversizeCorrection
                )
                setEditingReportFormData(response?.data?.data?.jsonData);
            }

            UserManagement.getAllUsers().then(usersResponse => {
                if (usersResponse.status == 200) {
                    const userNameOptions = usersResponse.data.data.map(user => {
                        return {
                            value: user.userName,
                            displayValue: user.userName
                        }
                    })
                    setUserNameSelectOptions(userNameOptions)
                }
            })
        })
    }, [dispatchRequestWorkOrderId, reportForm, setEditingReport, setEditingReportFormData])

    useEffect(() => { 
        
    }, [isCorrectionSelected])

    const getParsedReportData = async (validationRequired) => {
        let updateReportData = {};
        if (validationRequired) {
            updateReportData = await reportForm.validateFields();
        } else {
            updateReportData = reportForm.getFieldsValue();
        }

        return {
            chartStyle: updateReportData.chartStyle,
            specificGravity: updateReportData.specificGravity,
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

    const handleSubmit = async () => {
        setGlobalSpinState(true);
        try {
            const updateRequest = await getParsedReportData(true);
            await ReportsService.updateWorkOrderReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId, jsonData: JSON.stringify(updateRequest) });
            notification['success']({
                message: strings.COMMON.REPORT_SUBMIT_SUCCESS,
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.REPORT_UPDATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }

    const addLiquidLimits = (value) => {
        liquidLimits.push(Number(value));
        return value;
    }

    const handleProjectSpecificationsCalculationsDataChange = (propIndex, propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation
                    }
                },
                chartSection: {
                    items:
                        reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => {
                            if (chartSectionItemIndex == propIndex) {
                                if (propName == strings.REPORTS.PROPS_NAME.PERCENT_OF_WATER_ADDED) {
                                    return {
                                        ...i,
                                        projectSpecificationsCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            materialMass: i?.projectSpecificationsCalculationItem?.materialMass
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        projectSpecificationsCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            percentOfWaterAdded: i?.projectSpecificationsCalculationItem?.percentOfWaterAdded
                                        }
                                    }
                                }
                            } else {
                                return i;
                            }
                        })
                }
            }
        }
        setReportData(updatedData);
    }

    const handleCompactionTestCalculationsDataChange = (propIndex, propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation
                    }
                },
                chartSection: {
                    items:
                        reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => {
                            if (chartSectionItemIndex == propIndex) {
                                if (propName == strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE) {
                                    return {
                                        ...i,
                                        compactionTestCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            volumeConversionFactor: i?.compactionTestCalculationItem?.volumeConversionFactor,
                                            tare: i?.compactionTestCalculationItem?.tare
                                        }
                                    }
                                } else if (propName == strings.REPORTS.PROPS_NAME.VOLUME_CONVERSION_FACTOR) {
                                    return {
                                        ...i,
                                        compactionTestCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMaterialPlusTare: i?.compactionTestCalculationItem?.wetMaterialPlusTare,
                                            tare: i?.compactionTestCalculationItem?.tare
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        compactionTestCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMaterialPlusTare: i?.compactionTestCalculationItem?.wetMaterialPlusTare,
                                            volumeConversionFactor: i?.compactionTestCalculationItem?.volumeConversionFactor,
                                        }
                                    }
                                }
                            } else {
                                return i;
                            }
                        })
                }
            }
        }
        setReportData(updatedData);
    }

    const handleMoistureContentCalculationsDataChange = (propIndex, propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation
                    }
                },
                chartSection: {
                    items:
                        reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => {
                            if (chartSectionItemIndex == propIndex) {
                                if (propName == strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE) {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            dryMaterialPlusTare: i?.moistureContentCalculationItem?.dryMaterialPlusTare,
                                            tare: i?.moistureContentCalculationItem?.tare
                                        }
                                    }
                                } else if (propName == strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE) {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMaterialPlusTare: i?.moistureContentCalculationItem?.wetMaterialPlusTare,
                                            tare: i?.moistureContentCalculationItem?.tare
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMaterialPlusTare: i?.moistureContentCalculationItem?.wetMaterialPlusTare,
                                            dryMaterialPlusTare: i?.moistureContentCalculationItem?.dryMaterialPlusTare,
                                        }
                                    }
                                }
                            } else {
                                return i;
                            }
                        })
                }
            }
        }
        setReportData(updatedData);
    }

    const handleLiquidLimitsDataChange = (propIndex, propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        items:
                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation?.items.map((i, liquidLimitCalculationIndex) => {
                                if (liquidLimitCalculationIndex == propIndex) {
                                    if (propName == strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE) {
                                        return {
                                            ...i,
                                            [propName]: value ? Number(value) : value
                                        }
                                    } else if (propName == strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE) {
                                        return {
                                            ...i,
                                            [propName]: value ? Number(value) : value
                                        }
                                    } else if (propName == strings.REPORTS.PROPS_NAME.TARE) {
                                        return {
                                            ...i,
                                            [propName]: value ? Number(value) : value
                                        }
                                    } else {
                                        return {
                                            ...i,
                                            [propName]: value ? Number(value) : value
                                        }
                                    }
                                } else {
                                    return i;
                                }
                            })
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation
                    }
                },
                chartSection: {
                    ...reportData?.soilMoistureDensityRelationshipCalculations?.chartSection
                }
            }
        }
        setReportData(updatedData);
    }

    const handlePlasticLimitsDataChange = (propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation,
                        [propName]: value ? Number(value) : value
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation
                    }
                },
                chartSection: {
                    ...reportData?.soilMoistureDensityRelationshipCalculations?.chartSection
                }
            }
        }
        setReportData(updatedData);
    }

    const handlePercentPassSieveDataChange = (propName, value) => {
        var updatedData = {
            ...reportData,
            soilMoistureDensityRelationshipCalculations: {
                projectSpecification: {
                    liquidLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation
                    },
                    plasticLimitCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation
                    },
                    percentPassSieveCalculation: {
                        ...reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation,
                        [propName]: value ? Number(value) : value
                    }
                },
                chartSection: {
                    ...reportData?.soilMoistureDensityRelationshipCalculations?.chartSection
                }
            }
        }
        setReportData(updatedData);
    }

    const handleUseCorrectionChange = (value) => {
        setIsCorrectionSelected(value)
    }

    const handleSpecificGravityChange = (value) => {
        var updatedData = {
            ...reportData,
            specificGravity: value,
        }
        
        setReportData(updatedData);
    }

    const handleCorrectionChange = (value, propName) => {
        var updatedData = {
            ...reportData,
            [propName]: value,
        }

        setReportData(updatedData);
    }

    return (
        <div className="report-layout soil-mdr-layout" style={{ flexDirection: 'column' }}>
            <Divider orientation="left">{strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY}</Divider>
            {
                !!reportData && (
                    <Form form={reportForm} onChange={onFormValuesChange}>
                        <Row>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Contractor" name="contractor" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Classification" name="classification" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Initial Weight (Dry)" name="material" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Material Preparation" name="materialPreparation" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Date Sampled" name="dateSampled" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Rammer Type" name="rammerType" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Sample Location" name="sampleLocation" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Sampled By" name="sampledBy" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Test For" name="testFor" />
                            </Col>
                            <Col span={6}>
                                <CustomInput defaultFocused={true} type="text" placeHolder="Test Method" name="testMethod" />
                            </Col>
                            <Col span={6}>
                                <CustomSingleOptionSelect
                                    placeholder={strings.REPORTS.LABELS.TESTED_BY}
                                    options={userNameSelectOptions}
                                    dropdownClassName="report-type-dropdown"
                                    name="testedBy"
                                />
                            </Col>
                            <Col span={6}>
                                <CustomInput
                                    defaultFocused={true}
                                    type="text"
                                    placeHolder={strings.REPORTS.LABELS.CHART_STYLE}
                                    name="chartStyle" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <CustomInput
                                    defaultFocused={true}
                                    type="text"
                                    placeHolder={strings.REPORTS.LABELS.SHOW_POINTS}
                                    name="showPoints" />
                            </Col>
                        </Row>

                        <Divider orientation="left">{strings.REPORTS.LABELS.PROJECT_SPECIFICATIONS_CALCULATIONS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.PERCENT_OF_WATER_ADDED}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", strings.REPORTS.PROPS_NAME.PERCENT_OF_WATER_ADDED]}
                                            onInputChange={(e) => handleProjectSpecificationsCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.PERCENT_OF_WATER_ADDED, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.MATERIAL_MASS}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", strings.REPORTS.PROPS_NAME.MATERIAL_MASS]}
                                            onInputChange={(e) => handleProjectSpecificationsCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.MATERIAL_MASS, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WATER_ADDED}
                                            value={calculateWaterAdded(i.projectSpecificationsCalculationItem.percentOfWaterAdded, i.projectSpecificationsCalculationItem.materialMass)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.ADMIXTURE_MASS}
                                            value={calculateAdmixtureMass(
                                                i.projectSpecificationsCalculationItem.materialMass,
                                                calculateWaterAdded(
                                                    i.projectSpecificationsCalculationItem.percentOfWaterAdded,
                                                    i.projectSpecificationsCalculationItem.materialMass
                                                )
                                            )}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.COMPACTION_TEST_CALCULATIONS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE]}
                                            onInputChange={(e) => handleCompactionTestCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.VOLUME_CONVERSION_FACTOR}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", strings.REPORTS.PROPS_NAME.VOLUME_CONVERSION_FACTOR]}
                                            onInputChange={(e) => handleCompactionTestCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.VOLUME_CONVERSION_FACTOR, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", strings.REPORTS.PROPS_NAME.TARE]}
                                            onInputChange={(e) => handleCompactionTestCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.TARE, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL}
                                            value={calculateWetMaterial(i.compactionTestCalculationItem.wetMaterialPlusTare, i.compactionTestCalculationItem.tare)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_DENSITY_OF_SPECIMEN}
                                            value={calculateWetDensityOfSpecimen(
                                                calculateWetMaterial(
                                                    i.compactionTestCalculationItem.wetMaterialPlusTare,
                                                    i.compactionTestCalculationItem.tare
                                                ),
                                                i.compactionTestCalculationItem.volumeConversionFactor
                                            )}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.MOISTURE_CONTENT_CALCULATIONS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={4}>
                                        <CustomInput
                                            defaultFocused={true}
                                            type="text"
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.CAN_NUMBER}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.CAN_NUMBER]} 
                                            />
                                            
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL_PLUS_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.TARE]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WATER}
                                            value={calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare, i.moistureContentCalculationItem.dryMaterialPlusTare)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL}
                                            value={calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare, i.moistureContentCalculationItem.tare)} />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.RESULTS}</Divider>
                        <div className="results-container">
                            <div className="oversize-correction-wrapper">
                                <Form.Item valuePropName="checked" name="useOversizeCorrection" className="correction-item">
                                        <Switch
                                            checkedChildren="Calculate oversize" 
                                            unCheckedChildren="Don't calculate oversize"
                                            onChange={handleUseCorrectionChange}
                                        />
                                </Form.Item> 
                                <CustomInputNumber
                                            className="correction-item"
                                            name="specificGravity"
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.SPECIFIC_GRAVITY}
                                            onInputChange={(e) => handleSpecificGravityChange(e)}
                                /> 
                                <CustomInputNumber
                                            className="correction-item"
                                            name="correctionPercentageOf"
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.CORRECTION_PERCENTAGE_OF}
                                            disabled={!isCorrectionSelected}
                                            onInputChange={(e) => handleCorrectionChange(e, "correctionPercentageOf")}
                                /> 
                                <CustomInputNumber
                                            className="correction-item"
                                            name="correctionPercentageMoisture"
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.CORRECTION_PERCENTAGE_MOISTURE}
                                            disabled={!isCorrectionSelected}
                                            onInputChange={(e) => handleCorrectionChange(e, "correctionPercentageMoisture")}
                                /> 
                            </div>
                            {
                                reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, results) => (
                                    <Row key={results}>
                                        <Col span={6}>
                                            <CustomInputNumber
                                                defaultFocused={true}
                                                disabled={true}
                                                placeHolder={strings.REPORTS.PLACEHOLDERS.MOISTURE_CONTENT_PERCENT}
                                                value={isCorrectionSelected
                                                    ? calculateMoistureContentPercentWithCorrection(
                                                        calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                            i.moistureContentCalculationItem.dryMaterialPlusTare
                                                        ),
                                                        calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                            i.moistureContentCalculationItem.tare
                                                        ),
                                                        reportData?.correctionPercentageOf,
                                                        reportData?.correctionPercentageMoisture
                                                    )
                                                    : 
                                                    calculateMoistureContentPercent(
                                                        calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                            i.moistureContentCalculationItem.dryMaterialPlusTare
                                                        ),
                                                        calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                            i.moistureContentCalculationItem.tare
                                                        )
                                                    )
                                                }
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <CustomInputNumber
                                                defaultFocused={true}
                                                disabled={true}
                                                placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_DENSITY_PCF}
                                                value={isCorrectionSelected
                                                    ?   calculateDryDensityPcfWithCorrection(
                                                        calculateWetDensityOfSpecimen(
                                                            calculateWetMaterial(
                                                                i.compactionTestCalculationItem.wetMaterialPlusTare,
                                                                i.compactionTestCalculationItem.tare),
                                                            i.compactionTestCalculationItem.volumeConversionFactor
                                                        ),
                                                        calculateMoistureContentPercent(
                                                            calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                                i.moistureContentCalculationItem.dryMaterialPlusTare
                                                            ),
                                                            calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                                i.moistureContentCalculationItem.tare
                                                            )
                                                        ),
                                                        reportData?.correctionPercentageOf,
                                                        reportData?.specificGravity
                                                    )           
                                                    :   calculateDryDensityPcf(
                                                        calculateWetDensityOfSpecimen(
                                                            calculateWetMaterial(
                                                                i.compactionTestCalculationItem.wetMaterialPlusTare,
                                                                i.compactionTestCalculationItem.tare),
                                                            i.compactionTestCalculationItem.volumeConversionFactor
                                                        ),
                                                        calculateMoistureContentPercent(
                                                            calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                                i.moistureContentCalculationItem.dryMaterialPlusTare
                                                            ),
                                                            calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                                i.moistureContentCalculationItem.tare
                                                            )
                                                        )
                                                    )                                      
                                                }
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <CustomInputNumber
                                                defaultFocused={true}
                                                disabled={true}
                                                placeHolder={strings.REPORTS.PLACEHOLDERS.ZERO_VOIDS_POINT}
                                                value={calculateZeroVoidsPoint(
                                                    isCorrectionSelected
                                                    ? calculateMoistureContentPercentWithCorrection(
                                                        calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                            i.moistureContentCalculationItem.dryMaterialPlusTare
                                                        ),
                                                        calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                            i.moistureContentCalculationItem.tare
                                                        ),
                                                        reportData?.correctionPercentageOf,
                                                        reportData?.correctionPercentageMoisture
                                                    )
                                                    : 
                                                    calculateMoistureContentPercent(
                                                        calculateWater(i.moistureContentCalculationItem.wetMaterialPlusTare,
                                                            i.moistureContentCalculationItem.dryMaterialPlusTare
                                                        ),
                                                        calculateDryMaterial(i.moistureContentCalculationItem.dryMaterialPlusTare,
                                                            i.moistureContentCalculationItem.tare
                                                        )
                                                    ),
                                                    reportData.specificGravity
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                ))
                            }
                        </div>
                        <Divider orientation="left">{strings.REPORTS.LABELS.LIQUID_LIMIT}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.liquidLimitCalculation?.items?.map((i, liquidLimitCalculationIndex) => (
                                <Row key={liquidLimitCalculationIndex}>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${liquidLimitCalculationIndex}`, strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE]}
                                            onInputChange={(e) => handleLiquidLimitsDataChange(liquidLimitCalculationIndex, strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL_PLUS_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${liquidLimitCalculationIndex}`, strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE]}
                                            onInputChange={(e) => handleLiquidLimitsDataChange(liquidLimitCalculationIndex, strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${liquidLimitCalculationIndex}`, strings.REPORTS.PROPS_NAME.TARE]}
                                            onInputChange={(e) => handleLiquidLimitsDataChange(liquidLimitCalculationIndex, strings.REPORTS.PROPS_NAME.TARE, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.NUMBER_OF_BLOWS}
                                            name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "liquidLimitCalculation", "items", `${liquidLimitCalculationIndex}`, strings.REPORTS.PROPS_NAME.NUMBER_OF_BLOWS]}
                                            onInputChange={(e) => handleLiquidLimitsDataChange(liquidLimitCalculationIndex, strings.REPORTS.PROPS_NAME.NUMBER_OF_BLOWS, e)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.MOISTURE_CONTENT}
                                            value={calculateMoistureContent(i.wetMaterialPlusTare, i.dryMaterialPlusTare, i.tare)} />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.LIQUID_LIMIT}
                                            value={addLiquidLimits(
                                                calculateLiquidLimit(
                                                    calculateMoistureContent(
                                                        i.wetMaterialPlusTare,
                                                        i.dryMaterialPlusTare,
                                                        i.tare
                                                    ),
                                                    i.numberOfBlows
                                                )
                                            )}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        {
                            <Row>
                                <Col span={4}>
                                    <CustomInputNumber
                                        defaultFocused={true}
                                        disabled={true}
                                        placeHolder={strings.REPORTS.PLACEHOLDERS.AVERAGE_LIQUID_LIMIT}
                                        value={liquidLimits.length && calculateAverageValue(liquidLimits)} />
                                </Col>
                            </Row>
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.PLASTIC_LIMIT}</Divider>
                        <Row>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE]}
                                    onInputChange={(e) => handlePlasticLimitsDataChange(strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL_PLUS_TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE]}
                                    onInputChange={(e) => handlePlasticLimitsDataChange(strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "plasticLimitCalculation", strings.REPORTS.PROPS_NAME.TARE]}
                                    onInputChange={(e) => handlePlasticLimitsDataChange(strings.REPORTS.PROPS_NAME.TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    disabled={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.PLASTIC_LIMIT}
                                    value={calculatePlasticLimit(
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.wetMaterialPlusTare,
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.dryMaterialPlusTare,
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.tare
                                    )} />
                            </Col>
                        </Row>
                        <Divider orientation="left">{strings.REPORTS.LABELS.PLASTICITY_INDEX}</Divider>
                        <Row>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    disabled={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.PLASTICITY_INDEX}
                                    value={calculatePlasticityIndex(
                                        liquidLimits.length && calculateAverageValue(liquidLimits),
                                        calculatePlasticLimit(
                                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.wetMaterialPlusTare,
                                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.dryMaterialPlusTare,
                                            reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.plasticLimitCalculation?.tare
                                        )
                                    )}
                                />
                            </Col>
                        </Row>
                        <Divider orientation="left">{strings.REPORTS.LABELS.PERCENT_PASS_SIEVE}</Divider>
                        <Row>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE]}
                                    onInputChange={(e) => handlePercentPassSieveDataChange(strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL_PLUS_TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE]}
                                    onInputChange={(e) => handlePercentPassSieveDataChange(strings.REPORTS.PROPS_NAME.DRY_MATERIAL_PLUS_TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.TARE}
                                    name={["soilMoistureDensityRelationshipCalculations", "projectSpecification", "percentPassSieveCalculation", strings.REPORTS.PROPS_NAME.TARE]}
                                    onInputChange={(e) => handlePercentPassSieveDataChange(strings.REPORTS.PROPS_NAME.TARE, e)} />
                            </Col>
                            <Col span={6}>
                                <CustomInputNumber
                                    defaultFocused={true}
                                    disabled={true}
                                    placeHolder={strings.REPORTS.PLACEHOLDERS.PERCENT_PASS}
                                    value={calculatePercentPass(
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation?.wetMaterialPlusTare,
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation?.dryMaterialPlusTare,
                                        reportData?.soilMoistureDensityRelationshipCalculations?.projectSpecification?.percentPassSieveCalculation?.tare
                                    )}
                                />
                            </Col>
                        </Row>
                    </Form>
                )
            }
            <Row justify="end">
                <Button onClick={handleSubmit} type="primary">
                    {strings.COMMON.SAVE}
                </Button>
            </Row>
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

export default connect(mapState, mapDispatch)(SoilMoistureDensityRelationshipEditLayout);