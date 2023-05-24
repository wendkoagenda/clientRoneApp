import React, { useEffect, useState } from 'react';
import { actions } from '../reports/reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { Col, Form, notification, Row, Divider, Tooltip } from 'antd';
import { strings } from '../../constants';
import { CustomInput } from '../../components/common';
import { useParams } from 'react-router';
import { CustomerPortalService, TrackingService,  } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';


const DEFAULT_PROJECT_DATA_HEIGHT = 720;
const DEFAULT_SET_BLOCK_OFFSET = 120;
const DEFAULT_TEST_ROW_HEIGHT = 75;

const CustomerConcreteCylindersEditLayout = (props) => {
    const { dispatchRequestWorkOrderId, projectId } = useParams();

    const {
        setReportTestsData,
        reportTestsData
    } = props;

    const [projectDataForm, setProjectDataForm] = useState({ projectSections: [] });
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
                testDataCollapse: false
            })
        });
        setCollapseState(tempCollapseArray);
    }

    const loadTestsData = async () => {
        try {
            const reportTestsResponse = await CustomerPortalService.getConcreteTestInfoById(dispatchRequestWorkOrderId);
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
            const reportResponse = await CustomerPortalService.getReportById(dispatchRequestWorkOrderId);
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
                    testDataCollapse: block == strings.REPORTS.LABELS.REPORT_OF_TESTS ? !item.testDataCollapse : item.testDataCollapse
                }
            } else {
                return item;
            }
        }));
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
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SPEC_SIZE]}
                                                    placeHolder={strings.REPORTS.LABELS.SPEC_SIZE}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DATE_PLACED]}
                                                    placeHolder={strings.REPORTS.LABELS.DATE_PLACED}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.OVERALL]}
                                                    placeHolder={strings.REPORTS.LABELS.OVERALL}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.BATCH_TIME]}
                                                    placeHolder={strings.REPORTS.LABELS.BATCH_TIME}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SAMPLE_TIME]}
                                                    placeHolder={strings.REPORTS.LABELS.SAMPLE_TIME}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_TEMP]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_TEMP}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.CONCRETE_TEMP]}
                                                    placeHolder={strings.REPORTS.LABELS.CONCRETE_TEMP}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_IN]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_IN}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_CONTENT]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_CONTENT}
                                                    step={0.1}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.UNIT_WEIGHT]}
                                                    placeHolder={strings.REPORTS.LABELS.UNIT_WEIGHT}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.WEATHER]}
                                                    placeHolder={strings.REPORTS.LABELS.WEATHER}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SPECIFICATION]}
                                                    placeHolder={strings.REPORTS.LABELS.SPECIFICATION}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.DAYS]}
                                                    placeHolder={strings.REPORTS.LABELS.DAYS}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_LOWER]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_LOWER}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.SLUMP_UPPER]}
                                                    placeHolder={strings.REPORTS.LABELS.SLUMP_UPPER}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_LOWER]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_LOWER}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.AIR_UPPER]}
                                                    placeHolder={strings.REPORTS.LABELS.AIR_UPPER}
                                                    type="number"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.CONCRETE_SUPPLIER]}
                                                    placeHolder={strings.REPORTS.LABELS.CONCRETE_SUPPLIER}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.PLANT]}
                                                    placeHolder={strings.REPORTS.LABELS.PLANT}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TRUCK]}
                                                    placeHolder={strings.REPORTS.LABELS.TRUCK}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.MIX_CODE]}
                                                    placeHolder={strings.REPORTS.LABELS.MIX_CODE}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.PICKUP_LOCATION]}
                                                    placeHolder={strings.REPORTS.LABELS.PICKUP_LOCATION}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TICKET]}
                                                    placeHolder={strings.REPORTS.LABELS.TICKET}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={[48, 8]}>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.TEST_METHOD]}
                                                    placeHolder={strings.REPORTS.LABELS.TEST_METHOD}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.REMARKS]}
                                                    placeHolder={strings.REPORTS.LABELS.REMARKS}
                                                    type="text"
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <CustomInput
                                                    defaultValue={item[strings.REPORTS.PROPS_NAME.ATTACHMENTS]}
                                                    placeHolder={strings.REPORTS.LABELS.ATTACHMENTS}
                                                    type="text"
                                                    disabled={true}
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
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.COMPRESSIVE]}
                                                            type="number"
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                    <Col span={3} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.DIAMETER]}
                                                            type="number"
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.MAXIMUM_LOAD]}
                                                            type="text"
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.FRACTURE]}
                                                            type="text"
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                    <Col span={4} className="test-column">
                                                        <CustomInput
                                                            value={i[strings.REPORTS.PROPS_NAME.TESTED_BY]}
                                                            type="text"
                                                            disabled={true}
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

export default connect(mapState, mapDispatch)(CustomerConcreteCylindersEditLayout);