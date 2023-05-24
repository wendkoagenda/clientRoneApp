import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Button, Col, Divider, Form, notification, Row } from 'antd';
import { strings } from '../../constants';
import { ReportsService, TrackingService, UserManagement } from '../../services';
import { CustomInput, CustomInputNumber, CustomSingleOptionSelect } from '../../components/common';
import { getErrorMessage } from '../../services/tracking.service';
import {
    calculateAverageValue,
    calculateDryDensityPcf,
    calculateDryMaterial,
    calculateLiquidLimit,
    calculateMoistureContent,
    calculateMoistureContentPercent,
    calculatePercentPass,
    calculatePlasticityIndex,
    calculatePlasticLimit,
    calculateZeroVoidsPoint
} from '../../helpers/moisture-density-relationship-reports-calculations-helper';
import {
    calculateDryMaterialMass,
    calculateVolumeOfMaterial,
    calculateWaterAdded,
    calculateWaterMass,
    calculateWetDensity,
    calculateWetMaterial
} from '../../helpers/moisture-density-relationship-reports-tex113e-calculations-helper';

const SoilMoistureDensityRelationshipMethodBEditLayout = ({
    setEditingReport,
    setEditingReportFormData,
    setGlobalSpinState,
    isReportItemLayout
}) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [userNameSelectOptions, setUserNameSelectOptions] = useState([]);
    const [reportForm] = Form.useForm();
    const liquidLimits = [];

    useEffect(() => {
        ReportsService.getReportById(dispatchRequestWorkOrderId).then(response => {
            const parsedData = JSON.parse(response?.data?.data?.jsonData);
            setEditingReport(response.data.data);
            if (parsedData) {
                reportForm.setFieldsValue(parsedData.projectSections[0]);
                setReportData(parsedData.projectSections[0]);
                reportForm.setFieldsValue({ chartStyle: parsedData.chartStyle })

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
                                        heightOfMaterial: obj.heightOfMaterial,
                                        volumeOfMold: obj.volumeOfMold,
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

    const calculateAverageLiquidLimit = (value) => {
        liquidLimits.push(Number(value));
        return value;
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
                                    return {
                                        ...i,
                                        [propName]: value ? Number(value) : value
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

    const handleChartSectionItemDataChange = (propIndex, propName, value) => {
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
                    items:
                        reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => {
                            if (chartSectionItemIndex == propIndex) {
                                if (propName == strings.REPORTS.PROPS_NAME.HEIGHT_OF_MATERIAL) {
                                    return {
                                        ...i,
                                        [propName]: value ? Number(value) : value,
                                        volumeOfMold: i?.volumeOfMold
                                    }
                                } else {
                                    return {
                                        ...i,
                                        [propName]: value ? Number(value) : value,
                                        heightOfMaterial: i?.heightOfMaterial
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
                                if (propName == strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_MOLD_TARE) {
                                    return {
                                        ...i,
                                        compactionTestCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            moldTare: i?.compactionTestCalculationItem?.moldTare
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        compactionTestCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMaterialPlusMoldTare: i?.compactionTestCalculationItem?.wetMaterialPlusMoldTare
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
                                if (propName == strings.REPORTS.PROPS_NAME.WET_MASS_PAN_AND_MATERIAL) {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            dryMassPanAndMaterial: i?.moistureContentCalculationItem?.dryMassPanAndMaterial,
                                            panTareMass: i?.moistureContentCalculationItem?.panTareMass
                                        }
                                    }
                                } else if (propName == strings.REPORTS.PROPS_NAME.DRY_MASS_PAN_AND_MATERIAL) {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMassPanAndMaterial: i?.moistureContentCalculationItem?.wetMassPanAndMaterial,
                                            panTareMass: i?.moistureContentCalculationItem?.panTareMass
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        moistureContentCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            wetMassPanAndMaterial: i?.moistureContentCalculationItem?.wetMassPanAndMaterial,
                                            dryMassPanAndMaterial: i?.moistureContentCalculationItem?.dryMassPanAndMaterial,
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
                                if (propName == strings.REPORTS.PROPS_NAME.TOTAL_PERCENT_WATER) {
                                    return {
                                        ...i,
                                        projectSpecificationsCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            materials: i?.projectSpecificationsCalculationItem?.materials
                                        }
                                    }
                                } else {
                                    return {
                                        ...i,
                                        projectSpecificationsCalculationItem: {
                                            [propName]: value ? Number(value) : value,
                                            totalPercentWater: i?.projectSpecificationsCalculationItem?.totalPercentWater
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
                                    placeHolder="Chart style, 'r' - regular, 's' - smooth [default]"
                                    name="chartStyle" />
                            </Col>
                        </Row>
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
                                            value={calculateAverageLiquidLimit(
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
                                        value={calculateAverageValue(liquidLimits)} />
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
                                    )}
                                />
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
                                        calculateAverageValue(liquidLimits),
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
                        <Divider />
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.HEIGHT_OF_MATERIAL}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, strings.REPORTS.PROPS_NAME.HEIGHT_OF_MATERIAL]}
                                            onInputChange={(e) => handleChartSectionItemDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.HEIGHT_OF_MATERIAL, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.VOLUME_OF_MOLD}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, strings.REPORTS.PROPS_NAME.VOLUME_OF_MOLD]}
                                            onInputChange={(e) => handleChartSectionItemDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.VOLUME_OF_MOLD, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.VOLUME_OF_MATERIAL}
                                            value={calculateVolumeOfMaterial(i.heightOfMaterial, i.volumeOfMold)}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_DENSITY}
                                            value={calculateWetDensity(
                                                calculateWetMaterial(
                                                    i.compactionTestCalculationItem.wetMaterialPlusMoldTare,
                                                    i.compactionTestCalculationItem.moldTare
                                                ),
                                                calculateVolumeOfMaterial(
                                                    i.heightOfMaterial,
                                                    i.volumeOfMold
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
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL_PLUS_MOLD_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_MOLD_TARE]}
                                            onInputChange={(e) => handleCompactionTestCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.WET_MATERIAL_PLUS_MOLD_TARE, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.MOLD_TARE}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "compactionTestCalculationItem", strings.REPORTS.PROPS_NAME.MOLD_TARE]}
                                            onInputChange={(e) => handleCompactionTestCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.MOLD_TARE, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MATERIAL}
                                            value={calculateWetMaterial(i.compactionTestCalculationItem.wetMaterialPlusMoldTare, i.compactionTestCalculationItem.moldTare)}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.MOISTURE_CONTENT_CALCULATIONS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WET_MASS_PAN_AND_MATERIAL}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.WET_MASS_PAN_AND_MATERIAL]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.WET_MASS_PAN_AND_MATERIAL, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MASS_PAN_AND_MATERIAL}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.DRY_MASS_PAN_AND_MATERIAL]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.DRY_MASS_PAN_AND_MATERIAL, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.PAN_TARE_MASS}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "moistureContentCalculationItem", strings.REPORTS.PROPS_NAME.PAN_TARE_MASS]}
                                            onInputChange={(e) => handleMoistureContentCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.PAN_TARE_MASS, e)} />
                                    </Col>
                                    <Col span={5}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_MATERIAL_MASS}
                                            value={calculateDryMaterialMass(i.moistureContentCalculationItem.dryMassPanAndMaterial, i.moistureContentCalculationItem.panTareMass)}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WATER_MASS}
                                            value={calculateWaterMass(i.moistureContentCalculationItem.wetMassPanAndMaterial, i.moistureContentCalculationItem.dryMassPanAndMaterial)}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.RESULTS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, results) => (
                                <Row key={results}>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.MOISTURE_CONTENT_PERCENT}
                                            value={calculateMoistureContentPercent(
                                                calculateWaterMass(
                                                    i.moistureContentCalculationItem.wetMassPanAndMaterial,
                                                    i.moistureContentCalculationItem.dryMassPanAndMaterial
                                                ),
                                                calculateDryMaterial(
                                                    i.moistureContentCalculationItem.dryMassPanAndMaterial,
                                                    i.moistureContentCalculationItem.panTareMass
                                                )
                                            )}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.DRY_DENSITY_PCF}
                                            value={calculateDryDensityPcf(
                                                calculateWetDensity(
                                                    calculateWetMaterial(
                                                        i.compactionTestCalculationItem.wetMaterialPlusMoldTare,
                                                        i.compactionTestCalculationItem.moldTare
                                                    ),
                                                    calculateVolumeOfMaterial(
                                                        i.heightOfMaterial,
                                                        i.volumeOfMold
                                                    )
                                                ),
                                                calculateMoistureContentPercent(
                                                    calculateWaterMass(
                                                        i.moistureContentCalculationItem.wetMassPanAndMaterial,
                                                        i.moistureContentCalculationItem.dryMassPanAndMaterial
                                                    ),
                                                    calculateDryMaterial(
                                                        i.moistureContentCalculationItem.dryMassPanAndMaterial,
                                                        i.moistureContentCalculationItem.panTareMass
                                                    )
                                                )
                                            )}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.ZERO_VOIDS_POINT}
                                            value={calculateZeroVoidsPoint(
                                                calculateMoistureContentPercent(
                                                    calculateWaterMass(
                                                        i.moistureContentCalculationItem.wetMassPanAndMaterial,
                                                        i.moistureContentCalculationItem.dryMassPanAndMaterial
                                                    ),
                                                    calculateDryMaterial(
                                                        i.moistureContentCalculationItem.dryMassPanAndMaterial,
                                                        i.moistureContentCalculationItem.panTareMass
                                                    )
                                                )
                                            )}
                                        />
                                    </Col>
                                </Row>
                            ))
                        }
                        <Divider orientation="left">{strings.REPORTS.LABELS.PROJECT_SPECIFICATIONS_CALCULATIONS}</Divider>
                        {
                            reportData?.soilMoistureDensityRelationshipCalculations?.chartSection?.items?.map((i, chartSectionItemIndex) => (
                                <Row key={chartSectionItemIndex}>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.TOTAL_PERCENT_WATER}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", strings.REPORTS.PROPS_NAME.TOTAL_PERCENT_WATER]}
                                            onInputChange={(e) => handleProjectSpecificationsCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.TOTAL_PERCENT_WATER, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.MATERIALS}
                                            name={["soilMoistureDensityRelationshipCalculations", "chartSection", "items", `${chartSectionItemIndex}`, "projectSpecificationsCalculationItem", strings.REPORTS.PROPS_NAME.MATERIALS]}
                                            onInputChange={(e) => handleProjectSpecificationsCalculationsDataChange(chartSectionItemIndex, strings.REPORTS.PROPS_NAME.MATERIALS, e)} />
                                    </Col>
                                    <Col span={6}>
                                        <CustomInputNumber
                                            defaultFocused={true}
                                            disabled={true}
                                            placeHolder={strings.REPORTS.PLACEHOLDERS.WATER_ADDED}
                                            value={calculateWaterAdded(i.projectSpecificationsCalculationItem.totalPercentWater, i.projectSpecificationsCalculationItem.materials)} />
                                    </Col>
                                </Row>
                            ))
                        }
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

export default connect(mapState, mapDispatch)(SoilMoistureDensityRelationshipMethodBEditLayout);