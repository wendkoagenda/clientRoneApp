import React, { useEffect, useState } from 'react';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Form, notification, Row, Divider, Button } from 'antd';
import { strings } from '../../constants';
import { CustomInput } from '../../components/common';
import { useParams } from 'react-router';
import { ReportsService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';
import BreakListService from '../../services/break-list.service';
import { calculateDryDensity } from '../../helpers/math-helper';

const DEFAULT_PROJECT_DATA_HEIGHT = 450;
const DEFAULT_SET_BLOCK_OFFSET = 110;
const DEFAULT_TEST_ROW_HEIGHT = 75;
const DEFAULT_MOISTURE_RELATIONS_ROW_HEIGHT = 75;

const SoilInPlaceDensityTestingEditLayout = (props) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();

    const {
        setReportTestsData,
        reportTestsData
    } = props;

    const [projectDataForm, setProjectDataForm] = useState([]);
    const [testsDataForm, setTestsDataForm] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [collapseState, setCollapseState] = useState();

    const setInitialCollapseState = (data) => {
        let tempCollapseArray = [];

        data.projectSections.forEach(element => {
            tempCollapseArray.push({
                setNumber: element.setNumber,
                setCollapse: false,
                projectDataCollapse: false,
                testDataCollapse: false,
                soilMoistureDensityCollapse: false,
            })
        });
        setCollapseState(tempCollapseArray);
    }

    const loadTestsData = async () => {
        try {
            const reportTestsResponse = await ReportsService.getSoilTestInfoById(dispatchRequestWorkOrderId);
            if (reportTestsResponse.status == 200) {
                setReportTestsData(reportTestsResponse.data.data);
                setTestsDataForm(reportTestsResponse.data.data);
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.LOAD_REPORTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const initialReportForm = async () => {
        try {
            const reportResponse = await ReportsService.getReportById(dispatchRequestWorkOrderId);
            props.setEditingReport(reportResponse.data.data);
            if (reportResponse.status == 200) {
                const parsedData = populateCustomReportDataProperties(JSON.parse(reportResponse.data.data.jsonData));

                setReportData(parsedData);
                setProjectDataForm(parsedData);
                setInitialCollapseState(parsedData);
                await loadTestsData();
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

    const handleSetCollapse = (id, block) => {
        setCollapseState(prev => prev.map(item => {
            if (item.setNumber == id) {
                return {
                    ...item,
                    setCollapse: block == strings.REPORTS.LABELS.SET ? !item.setCollapse : item.setCollapse,
                    projectDataCollapse: block == strings.REPORTS.LABELS.PROJECT_DATA ? !item.projectDataCollapse : item.projectDataCollapse,
                    soilMoistureDensityCollapse: block == strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY ? !item.soilMoistureDensityCollapse : item.soilMoistureDensityCollapse,
                    testDataCollapse: block == strings.REPORTS.LABELS.REPORT_OF_TESTS ? !item.testDataCollapse : item.testDataCollapse
                }
            } else {
                return item;
            }
        }));
    }

    const handleSoilMoistureDensityDataChange = (e, setNumber, moistureDensityReport, propName, isNumber) => {
        const updatedData = {
            projectSections: projectDataForm.projectSections.filter(i => i.setNumber == setNumber).map(i => {
                return {
                    ...i,
                    moistureDensityRelations: i.moistureDensityRelations?.map(mdr => {
                        if (mdr.moistureDensityReport == moistureDensityReport) {
                            return {
                                ...mdr,
                                [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null
                            }
                        } else {
                            return mdr;
                        }
                    })
                }
            })
        }

        setReportData(updatedData);
        setProjectDataForm(updatedData);
        props.setEditingReportFormData(JSON.stringify(updatedData))
    }

    const handleProjectDataChange = (e, setNumber, propName, isNumber, forceUpdate = false) => {
        const updatedData = {
            projectSections: projectDataForm.projectSections.map(i => {
                if (i.setNumber == setNumber) {
                    return {
                        ...i,
                        [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null
                    }
                } else {
                    return i;
                }
            })
        }

        if (forceUpdate) {
            reportData.projectSections?.map(item => {
                if (item.setNumber == setNumber) {
                    item[propName] = e.target.value;
                }
            });
        }

        setProjectDataForm(updatedData);
        props.setEditingReportFormData(JSON.stringify(updatedData))
    }

    const handleTestDataChange = (e, id, propName, isNumber) => {
        const updatedData = testsDataForm.map(i => {
            if (i.id == id) {
                return {
                    ...i,
                    [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null
                }
            } else {
                return i;
            }
        });

        setTestsDataForm(updatedData)
        setReportTestsData(updatedData);
    }

    const handleEditMoistureOrWetDensityDataChange = (e, id, propName, isNumber) => {
        const updatedData = testsDataForm.map(i => {
            if (i.id == id && propName === strings.REPORTS.PROPS_NAME.MOISTURE) {
                return {
                    ...i,
                    [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null,
                    dryDensity: calculateDryDensity(Number(e.target.value), Number((i)[strings.REPORTS.PROPS_NAME.WET_DENSITY]))
                }
            } else {
                return {
                    ...i,
                    [propName]: e.target.value ? (isNumber ? Number(e.target.value) : e.target.value.toString()) : null,
                    dryDensity: calculateDryDensity(Number((i)[strings.REPORTS.PROPS_NAME.MOISTURE]), Number(e.target.value))
                }
            }
        });

        setTestsDataForm(updatedData)
        setReportTestsData(updatedData);
    }

    const handleFormSubmit = async () => {
        props.setGlobalSpinState(true);
        try {
            const updateProjectReportResponse = await ReportsService.updateWorkOrderReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId, jsonData: JSON.stringify(projectDataForm) });
            if (updateProjectReportResponse.status == 200 && testsDataForm && testsDataForm.length) {
                await BreakListService.updateSoilSpecInfo(testsDataForm);
            }

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
            <Divider orientation="left">{strings.REPORTS.LABELS.SOIL_IN_PLACE_DENSITY_TESTING}</Divider>
            {!!reportData &&
                (reportData.projectSections?.map((item, index) => {
                    const collapseObject = collapseState?.find(i => i?.setNumber == item?.setNumber);
                    const isSetCollapsed = collapseObject?.setCollapse;
                    const isProjectDataCollapsed = collapseObject?.projectDataCollapse;
                    const isSoilMoistureDensityCollapsed = collapseObject?.soilMoistureDensityCollapse;
                    const isTestDataCollapsed = collapseObject?.testDataCollapse;
                    const testsForSet = reportTestsData?.filter(i => i?.setNumber == item?.setNumber);
                    const calculatedTestBlockHeight = 80 + DEFAULT_TEST_ROW_HEIGHT * testsForSet?.length;
                    const calculatedMoistureRelationsBlockHeight = item?.moistureDensityRelations?.length ? 80 + DEFAULT_MOISTURE_RELATIONS_ROW_HEIGHT * item?.moistureDensityRelations?.length : DEFAULT_MOISTURE_RELATIONS_ROW_HEIGHT;
                    const calculatedMoistureRelationsHeightForAllSetBlock = 10 * item?.moistureDensityRelations?.length;
                    const calculatedProjectDataBlockHeight = isSoilMoistureDensityCollapsed ? 80 + DEFAULT_PROJECT_DATA_HEIGHT : DEFAULT_PROJECT_DATA_HEIGHT + calculatedMoistureRelationsBlockHeight;
                    const calculatedAllSetBlockHeight = DEFAULT_SET_BLOCK_OFFSET + (isProjectDataCollapsed ? 30 : calculatedProjectDataBlockHeight) + (isTestDataCollapsed ? 30 : calculatedTestBlockHeight) + (isSoilMoistureDensityCollapsed ? 30 : calculatedMoistureRelationsHeightForAllSetBlock);

                    return (
                        <div className="set-block" key={item.setNumber}>
                            <Row style={{ marginBottom: '20px' }}>
                                <Col span={12} className="set-label">{`${strings.REPORTS.LABELS.SET} ${item.setNumber}`}</Col>
                                <Col offset={11} span={1} className="collapse-icon">
                                    {isSetCollapsed
                                        ? <DownOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.SET)} />
                                        : <UpOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.SET)} />
                                    }
                                </Col>
                            </Row>
                            <div className="all-set-data" style={{ height: isSetCollapsed ? '0px' : `${calculatedAllSetBlockHeight}px` }}>
                                <div className="project-data" style={{ height: isProjectDataCollapsed ? '60px' : `${calculatedProjectDataBlockHeight}px` }}>
                                    <Row style={{ marginBottom: '30px' }}>
                                        <Col span={12} className="set-label">{strings.REPORTS.LABELS.PROJECT_DATA}</Col>
                                        <Col offset={11} span={1} className="collapse-icon">
                                            {isProjectDataCollapsed
                                                ? <DownOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.PROJECT_DATA)} />
                                                : <UpOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.PROJECT_DATA)} />
                                            }
                                        </Col>
                                    </Row>
                                    <Form style={{ width: '100%' }} name={`set-form-${item.setNumber}`}>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SET_NUMBER]}
                                                    placeHolder={strings.REPORTS.LABELS.SET_NUMBER}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SET_NUMBER, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.CONTRACTOR]}
                                                    placeHolder={strings.REPORTS.LABELS.CONTRACTOR}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.CONTRACTOR, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TEST_METHOD]}
                                                    placeHolder={strings.REPORTS.LABELS.TEST_METHOD}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.TEST_METHOD, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.GAUGE]}
                                                    placeHolder={strings.REPORTS.LABELS.GAUGE}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.GAUGE, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.GAUGE_SERIAL]}
                                                    placeHolder={strings.REPORTS.LABELS.GAUGE_SERIAL}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.GAUGE_SERIAL, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TEST_MODE]}
                                                    placeHolder={strings.REPORTS.LABELS.TEST_MODE}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.TEST_MODE, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.MOISTURE_CURRENT]}
                                                    placeHolder={strings.REPORTS.LABELS.MOISTURE_CURRENT}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.MOISTURE_CURRENT, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.MOISTURE_PREVIOUS]}
                                                    placeHolder={strings.REPORTS.LABELS.MOISTURE_PREVIOUS}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.MOISTURE_PREVIOUS, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DENSITY_CURRENT]}
                                                    placeHolder={strings.REPORTS.LABELS.DENSITY_CURRENT}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.DENSITY_CURRENT, true)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DENSITY_PREVIOUS]}
                                                    placeHolder={strings.REPORTS.LABELS.DENSITY_PREVIOUS}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.DENSITY_PREVIOUS, true)}
                                                />
                                            </Col>
                                        </Row>
                                        <div className="moisture-density-data" style={{ height: isSoilMoistureDensityCollapsed ? '60px' : `${calculatedMoistureRelationsBlockHeight}px`, display: !item.moistureDensityRelations?.length && 'none' }}>
                                            <Row style={{ marginBottom: '30px' }}>
                                                <Col span={12} className="set-label">{strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY}</Col>
                                                <Col offset={11} span={1} className="collapse-icon">
                                                    {isSoilMoistureDensityCollapsed
                                                        ? <DownOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY)} />
                                                        : <UpOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.SOIL_MOISTURE_DENSITY)} />
                                                    }
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={2} className="test-column">
                                                    {strings.REPORTS.LABELS.MOISTURE_DENSITY_REPORT}
                                                </Col>
                                                <Col span={4} className="test-column">
                                                    {strings.REPORTS.LABELS.PROJECT_MOISTURE}
                                                </Col>
                                                <Col span={4} className="test-column">
                                                    {strings.REPORTS.LABELS.REQUIREMENTS_DENSITY}
                                                </Col>
                                            </Row>
                                            {
                                                item?.moistureDensityRelations?.map(mdr => {
                                                    return (
                                                        <Row key={mdr.moistureDensityReport}>
                                                            <Col span={2} className="test-column">
                                                                <CustomInput
                                                                    value={mdr[strings.REPORTS.PROPS_NAME.MOISTURE_DENSITY_REPORT]}
                                                                    type="number"
                                                                    onInputChange={(e) => handleSoilMoistureDensityDataChange(e, item.setNumber, mdr.moistureDensityReport, strings.REPORTS.PROPS_NAME.MOISTURE_DENSITY_REPORT, false)}
                                                                />
                                                            </Col>
                                                            <Col span={4} className="test-column">
                                                                <CustomInput
                                                                    value={mdr[strings.REPORTS.PROPS_NAME.PROJECT_MOISTURE]}
                                                                    type="text"
                                                                    onInputChange={(e) => handleSoilMoistureDensityDataChange(e, item.setNumber, mdr.moistureDensityReport, strings.REPORTS.PROPS_NAME.PROJECT_MOISTURE, false)}
                                                                />
                                                            </Col>
                                                            <Col span={4} className="test-column">
                                                                <CustomInput
                                                                    value={mdr[strings.REPORTS.PROPS_NAME.REQUIREMENTS_DENSITY]}
                                                                    type="text"
                                                                    onInputChange={(e) => handleSoilMoistureDensityDataChange(e, item.setNumber, mdr.moistureDensityReport, strings.REPORTS.PROPS_NAME.REQUIREMENTS_DENSITY, false)}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )
                                                })
                                            }
                                        </div>
                                    </Form>
                                </div>
                                <div className="test-data" style={{ height: isTestDataCollapsed ? '60px' : `${calculatedTestBlockHeight}px`, display: !testsForSet?.length && 'none' }}>
                                    <Row style={{ marginBottom: '20px' }}>
                                        <Col span={12} className="set-label">{strings.REPORTS.LABELS.REPORT_OF_TESTS}</Col>
                                        <Col offset={11} span={1} className="collapse-icon">
                                            {isTestDataCollapsed
                                                ? <DownOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.REPORT_OF_TESTS)} />
                                                : <UpOutlined onClick={() => handleSetCollapse(item.setNumber, strings.REPORTS.LABELS.REPORT_OF_TESTS)} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={1} className="test-column">
                                            {strings.REPORTS.LABELS.NUMBER}
                                        </Col>
                                        <Col span={4} className="test-column">
                                            {strings.REPORTS.LABELS.TEST_LOCATION_TITLE}
                                        </Col>
                                        <Col span={4} className="test-column">
                                            {strings.REPORTS.LABELS.TEST_LOCATION_SUBTEXT}
                                        </Col>
                                        <Col span={3} className="test-column">
                                            {strings.REPORTS.LABELS.PROBE_DEPTH}
                                        </Col>
                                        <Col span={3} className="test-column">
                                            {strings.REPORTS.LABELS.MOISTURE}
                                        </Col>
                                        <Col span={3} className="test-column">
                                            {strings.REPORTS.LABELS.WET_DENSITY}
                                        </Col>
                                        <Col span={3} className="test-column">
                                            {strings.REPORTS.LABELS.DRY_DENSITY}
                                        </Col>
                                        <Col span={3} className="test-column">
                                            {strings.REPORTS.LABELS.DENSITY_MAX}
                                        </Col>
                                    </Row>
                                    {
                                        testsForSet?.map((i, index) => {
                                            return (
                                                <Row key={index}>
                                                    <Col span={1} className="test-column">
                                                        {index + 1}
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.TEST_LOCATION_TITLE]}
                                                            type="text"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.TEST_LOCATION_TITLE, false)}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.TEST_LOCATION_SUBTEXT]}
                                                            type="text"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.TEST_LOCATION_SUBTEXT, false)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.PROBE_DEPTH]).toFixed(2)}
                                                            type="number"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.PROBE_DEPTH, true)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.MOISTURE]).toFixed(2)}
                                                            type="number"
                                                            onInputChange={(e) => handleEditMoistureOrWetDensityDataChange(e, i.id, strings.REPORTS.PROPS_NAME.MOISTURE, true)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.WET_DENSITY]).toFixed(2)}
                                                            type="number"
                                                            onInputChange={(e) => handleEditMoistureOrWetDensityDataChange(e, i.id, strings.REPORTS.PROPS_NAME.WET_DENSITY, true)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.DRY_DENSITY]).toFixed(1)}
                                                            type="number"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.DRY_DENSITY, true)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.DENSITY_MAX]).toFixed(2)}
                                                            type="number"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.DENSITY_MAX, true)}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div >
                    )
                }))
            }
            <Row justify="end">
                <Button onClick={handleFormSubmit} type="primary">
                    {strings.COMMON.SAVE}
                </Button>
            </Row>
        </div >
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

export default connect(mapState, mapDispatch)(SoilInPlaceDensityTestingEditLayout);