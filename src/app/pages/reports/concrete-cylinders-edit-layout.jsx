import React, { useEffect, useState } from 'react';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Form, notification, Row, Divider, Button, Tooltip } from 'antd';
import { strings } from '../../constants';
import { CustomInput, CustomSingleOptionSelect } from '../../components/common';
import { useParams } from 'react-router';
import { ReportsService, TrackingService, UserManagement } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';
import { calculateArea, calculateCompressiveStrength } from "../../helpers/math-helper";
import { fractureTypeSelectOptions } from '../../constants/fractureTypes';
import { weatherOptions } from '../../constants/weather-types';
import TextArea from 'antd/lib/input/TextArea';

const DEFAULT_PROJECT_DATA_HEIGHT = 720;
const DEFAULT_SET_BLOCK_OFFSET = 120;
const DEFAULT_TEST_ROW_HEIGHT = 75;
const textareaStyles = {
    backgroundColor: 'inherit',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '10px 0',
    paddingTop: '0',
    borderBottom: '2px solid #DEDEDE'
};

const ConcreteCylindersEditLayout = (props) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();

    const {
        setReportTestsData,
        reportTestsData
    } = props;

    const [projectDataForm, setProjectDataForm] = useState({ projectSections: [] });
    const [testsDataForm, setTestsDataForm] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [collapseState, setCollapseState] = useState();
    const [userNameSelectOptions, setUserNameSelectOptions] = useState([]);

    const setInitialCollapseState = (data) => {
        let tempCollapseArray = [];

        data.projectSections.forEach(element => {
            tempCollapseArray.push({
                setNumber: element.setNumber,
                setCollapse: false,
                projectDataCollapse: false,
                testDataCollapse: false
            })
        });
        setCollapseState(tempCollapseArray);
    }

    const loadTestsData = async () => {
        try {
            const reportTestsResponse = await ReportsService.getConcreteTestInfoById(dispatchRequestWorkOrderId);
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

    const loadAllUsers = async () => {
        try {
            const usersResponse = await UserManagement.getAllUsers();
            if (usersResponse.status == 200) {
                const userNameOptions = usersResponse.data.data.map(user => {
                    return {
                        value: user.userName,
                        displayValue: user.userName
                    }
                })
                setUserNameSelectOptions(userNameOptions)
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.GET_USERS_ERROR);
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
                await loadAllUsers();
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
                    testDataCollapse: block == strings.REPORTS.LABELS.REPORT_OF_TESTS ? !item.testDataCollapse : item.testDataCollapse
                }
            } else {
                return item;
            }
        }));
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

    const handleDiameterChange = (value, id, propName, isNumber) => {
        const updatedDiameter = testsDataForm.map(i => {
            if (i.id == id) {
                var area = value ? calculateArea(value) : null;
                return {
                    ...i,
                    [propName]: value ? (isNumber ? Number(value) : value) : null,
                    area: area,
                    compressiveStrength: i.maximumLoad ? calculateCompressiveStrength(i.maximumLoad, area) : null
                }
            } else {
                return i;
            }

        })

        setTestsDataForm(updatedDiameter);
        setReportTestsData(updatedDiameter);
    }

    const handleMaximumLoadChange = (value, id, propName, isNumber) => {
        const updatedMaximumLoad = testsDataForm.map(i => {
            if (i.id == id) {
                return {
                    ...i,
                    [propName]: value ? (isNumber ? Number(value) : value) : null,
                    compressiveStrength: i.area ? calculateCompressiveStrength(value, i.area) : null
                }
            } else {
                return i;
            }

        })

        setTestsDataForm(updatedMaximumLoad);
        setReportTestsData(updatedMaximumLoad);
    }

    const handleTestDataValueChange = (value, id, propName, isNumber) => {
        const updatedData = testsDataForm.map(i => {
            if (i.id == id) {
                return {
                    ...i,
                    [propName]: value ? (isNumber ? Number(value) : value.toString()) : null
                }
            } else {
                return i;
            }
        });

        setTestsDataForm(updatedData);
        setReportTestsData(updatedData);
    }

    const handleFormSubmit = async () => {
        props.setGlobalSpinState(true);
        try {
            const updateProjectReportResponse = await ReportsService.updateWorkOrderReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId, jsonData: JSON.stringify(projectDataForm) });
            if (updateProjectReportResponse.status == 200 && testsDataForm && testsDataForm.length) {
                await ReportsService.upsertMultipleSpecInfo(testsDataForm);
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
            <Divider orientation="left">{strings.REPORTS.LABELS.CONCRETE_CYLINDERS}</Divider>
            {!!reportData &&
                (reportData.projectSections?.map(item => {
                    const collapseObject = collapseState?.find(i => i.setNumber == item.setNumber);
                    const isSetCollapsed = collapseObject?.setCollapse;
                    const isProjectDataCollapsed = collapseObject?.projectDataCollapse;
                    const isTestDataCollapsed = collapseObject?.testDataCollapse;
                    const testsForSet = reportTestsData?.filter(i => i.setNumber == item.setNumber);
                    const calculatedTestBlockHeight = 80 + DEFAULT_TEST_ROW_HEIGHT * testsForSet?.length;
                    const calculatedAllSetBlockHeight = DEFAULT_SET_BLOCK_OFFSET + (isProjectDataCollapsed ? 30 : DEFAULT_PROJECT_DATA_HEIGHT) + (isTestDataCollapsed ? 30 : calculatedTestBlockHeight);

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
                                <div className="project-data" style={{ height: isProjectDataCollapsed ? '60px' : `${DEFAULT_PROJECT_DATA_HEIGHT}px` }}>
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
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SET_LOCATION]}
                                                    placeHolder={strings.REPORTS.LABELS.SET_LOCATION}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SET_LOCATION, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SPEC_SIZE]}
                                                    placeHolder={strings.REPORTS.LABELS.SPEC_SIZE}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SPEC_SIZE, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DATE_PLACED]}
                                                    placeHolder={strings.REPORTS.LABELS.DATE_PLACED}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.DATE_PLACED, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.OVERALL]}
                                                    placeHolder={strings.REPORTS.LABELS.OVERALL}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.OVERALL, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.BATCH_TIME]}
                                                    placeHolder={strings.REPORTS.LABELS.BATCH_TIME}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.BATCH_TIME, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SAMPLE_TIME]}
                                                    placeHolder={strings.REPORTS.LABELS.SAMPLE_TIME}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SAMPLE_TIME, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_TEMP]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_TEMP}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.AIR_TEMP, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.CONCRETE_TEMP]}
                                                    placeHolder={strings.REPORTS.LABELS.CONCRETE_TEMP}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.CONCRETE_TEMP, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_IN]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_IN}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SLUMP_IN, true)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_CONTENT]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_CONTENT}
                                                    type="number"
                                                    step={0.1}
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.AIR_CONTENT, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.UNIT_WEIGHT] === null ? "N/A" : item[strings.REPORTS.PROPS_NAME.UNIT_WEIGHT]}
                                                    placeHolder={strings.REPORTS.LABELS.UNIT_WEIGHT}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.UNIT_WEIGHT, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <small className="custom-input-label">{strings.REPORTS.LABELS.WEATHER}</small>
                                                <CustomSingleOptionSelect
                                                    showHeader="true"
                                                    value={item[strings.REPORTS.PROPS_NAME.WEATHER]}
                                                    placeholder={strings.REPORTS.LABELS.WEATHER}
                                                    handleChange={(value) => handleProjectDataChange({ target: { value: value } }, item.setNumber, strings.REPORTS.PROPS_NAME.WEATHER, false, true)}
                                                    options={weatherOptions}
                                                    dropdownClassName="report-type-dropdown"
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SPECIFICATION]}
                                                    placeHolder={strings.REPORTS.LABELS.SPECIFICATION}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SPECIFICATION, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DAYS]}
                                                    placeHolder={strings.REPORTS.LABELS.DAYS}
                                                    type="number"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.DAYS, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_LOWER]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_LOWER}
                                                    type="number"
                                                    step={0.1}
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SLUMP_LOWER, true)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_UPPER]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_UPPER}
                                                    type="number"
                                                    step={0.1}
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.SLUMP_UPPER, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_LOWER]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_LOWER}
                                                    type="number"
                                                    step={0.1}
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.AIR_LOWER, true)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_UPPER]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_UPPER}
                                                    type="number"
                                                    step={0.1}
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.AIR_UPPER, true)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.CONCRETE_SUPPLIER]}
                                                    placeHolder={strings.REPORTS.LABELS.CONCRETE_SUPPLIER}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.CONCRETE_SUPPLIER, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.PLANT]}
                                                    placeHolder={strings.REPORTS.LABELS.PLANT}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.PLANT, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TRUCK]}
                                                    placeHolder={strings.REPORTS.LABELS.TRUCK}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.TRUCK, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.MIX_CODE]}
                                                    placeHolder={strings.REPORTS.LABELS.MIX_CODE}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.MIX_CODE, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.PICKUP_LOCATION]}
                                                    placeHolder={strings.REPORTS.LABELS.PICKUP_LOCATION}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.PICKUP_LOCATION, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TICKET]}
                                                    placeHolder={strings.REPORTS.LABELS.TICKET}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.TICKET, false)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <TextArea
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TEST_METHOD]}
                                                    placeHolder={strings.REPORTS.LABELS.TEST_METHOD}
                                                    type="text"
                                                    style={textareaStyles}
                                                    onChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.TEST_METHOD, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.REMARKS]}
                                                    placeHolder={strings.REPORTS.LABELS.REMARKS}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.REMARKS, false)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.ATTACHMENTS]}
                                                    placeHolder={strings.REPORTS.LABELS.ATTACHMENTS}
                                                    type="text"
                                                    onInputChange={(e) => handleProjectDataChange(e, item.setNumber, strings.REPORTS.PROPS_NAME.ATTACHMENTS, false)}
                                                />
                                            </Col>
                                        </Row>
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
                                        <Tooltip title={"Calculated based on Diameter"}>
                                            <Col span={4} className="test-column">
                                                {strings.BREAK_LIST.LABELS.AREA}
                                            </Col>
                                        </Tooltip>
                                        <Col span={4} className="test-column">
                                            {strings.BREAK_LIST.LABELS.COMPRESSIVE}
                                        </Col>
                                        <Tooltip title={"Calculated based on Spec Size"}>
                                            <Col span={3} className="test-column">
                                                {strings.BREAK_LIST.LABELS.DIAMETER}
                                            </Col>
                                        </Tooltip>
                                        <Col span={4} className="test-column">
                                            {strings.BREAK_LIST.LABELS.MAXIMUM_LOAD}
                                        </Col>
                                        <Col span={4} className="test-column">
                                            {strings.BREAK_LIST.LABELS.FRACTURE}
                                        </Col>
                                        <Col span={4} className="test-column">
                                            {strings.BREAK_LIST.LABELS.UPDATE_TESTED_INPUT}
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
                                                            value={Number((i)[strings.REPORTS.PROPS_NAME.AREA]).toFixed(2)}
                                                            type="number"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.AREA, true)}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.COMPRESSIVE]}
                                                            type="number"
                                                            onInputChange={(e) => handleTestDataChange(e, i.id, strings.REPORTS.PROPS_NAME.COMPRESSIVE, true)}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.DIAMETER]}
                                                            type="number"
                                                            onInputChange={(e) => handleDiameterChange(e.target.value, i.id, strings.REPORTS.PROPS_NAME.DIAMETER, true)}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.MAXIMUM_LOAD]}
                                                            type="text"
                                                            onInputChange={(e) => handleMaximumLoadChange(e.target.value, i.id, strings.REPORTS.PROPS_NAME.MAXIMUM_LOAD, true)}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomSingleOptionSelect
                                                            value={i[strings.REPORTS.PROPS_NAME.FRACTURE]}
                                                            placeholder={strings.BREAK_LIST.LABELS.FRACTURE}
                                                            handleChange={(value) => handleTestDataValueChange(value, i.id, strings.REPORTS.PROPS_NAME.FRACTURE, false)}
                                                            options={fractureTypeSelectOptions}
                                                            dropdownClassName="report-type-dropdown"
                                                            triggerNode={document.body}
                                                            style={{ "width": "184px" }}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomSingleOptionSelect
                                                            value={i[strings.REPORTS.PROPS_NAME.TESTED_BY]}
                                                            placeholder={strings.REPORTS.LABELS.TESTED_BY}
                                                            handleChange={(value) => handleTestDataValueChange(value, i.id, strings.REPORTS.PROPS_NAME.TESTED_BY, false)}
                                                            options={userNameSelectOptions}
                                                            triggerNode={document.body}
                                                            dropdownClassName="report-type-dropdown"
                                                            style={{ "width": "184px" }}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }))
            }
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

export default connect(mapState, mapDispatch)(ConcreteCylindersEditLayout);