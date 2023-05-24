import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux'
import { Button, notification, Popconfirm, Switch, Tabs } from 'antd';
import InvoicePage from '../invoice/invoice-page';
import { useParams } from 'react-router';
import { actions as invoiceActions } from '../invoice/invoice.reducer';
import { actions as reportsActions } from '../reports/reports-reducer';
import { reportTypesIds, strings } from '../../constants';
import ReportViewer from '../../pages/reports/report-viewer';
import ConcreteCylindersEditLayout from '../../pages/reports/concrete-cylinders-edit-layout';
import {
    EyeOutlined
} from "@ant-design/icons";
import { getErrorMessage } from '../../services/tracking.service';
import { InvoiceService, ReportsService, TrackingService } from '../../services';
import { useReactToPrint } from 'react-to-print';
import { handleInjectedScripts } from '../../helpers/project-report-data-helper';
import SoilMoistureDensityRelationshipEditLayout from '../reports/soil-moisture-density-relationship-edit-layout';
import SoilMoistureDensityRelationshipMethodBEditLayout from '../reports/soil-moisture-density-relationship-method-b-edit-layout';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import SoilInPlaceDensityTestingEditLayout from '../reports/soil-in-place-density-testing-edit-layout';
import ConcretePostTenstionInspectionEditLayout from '../reports/concrete-post-tension-inspection';
import { updateFooter } from '../../helpers/report-paginator';

const { TabPane } = Tabs;

const REPORT_LAYOUT_PREVIEW_DIV_ID = 'report-layout-pdf-doc-elem';

const ReportItemLayout = (props) => {

    const {
        setInvoiceSearchRequestFilterProps,
        setGlobalSpinState,
        setPaginatedInvoice,
        invoiceSearchRequest
    } = props;

    const reportRef = useRef();

    const handlePrint = 
        useReactToPrint({
            content: () => reportRef.current,
            onBeforePrint: () => setIsPreviewLoading(false),
            onAfterPrint: () =>  handleAfter()
        });

    const handleAfter = () => {
        document.getElementById(REPORT_LAYOUT_PREVIEW_DIV_ID).innerHTML = '';
    }
    

    const { dispatchRequestWorkOrderId, reportTypeId } = useParams();
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const setWorkOrderId = useCallback(() => {
        setInvoiceSearchRequestFilterProps('dispatchRequestWorkOrderIds', [dispatchRequestWorkOrderId]);
    }, [dispatchRequestWorkOrderId, setInvoiceSearchRequestFilterProps])

    useEffect(() => {
        setWorkOrderId();
    }, [dispatchRequestWorkOrderId, setWorkOrderId])

    const approveReport = async (dispatchRequestWorkOrderId) => {
        setGlobalSpinState(true);
        try {
            await ReportsService.approveReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId });
            props.approveEditingReport();

            const invoiceResponse = await InvoiceService.searchInvoiceByRequest(invoiceSearchRequest);
            setPaginatedInvoice(invoiceResponse.data.data);

            notification['success']({
                message: strings.COMMON.REPORT_APPROVED_SUCCESS,
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_APPROVE_REPORT);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    };

    const onPreview = async () => {
        setIsPreviewLoading(true);
        try {
            const responseFile = await ReportsService.previewReport({
                dispatchRequestWorkOrderId,
                jsonData: props.editingReportFormData,
                specimens: props.reportTestsData

            });
            document.getElementById(REPORT_LAYOUT_PREVIEW_DIV_ID).innerHTML = responseFile.data;
            handleInjectedScripts(reportTypeId);
            updateFooter(reportTypeId);
            handlePrint();

        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_LOAD_PREVIEW);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
        setIsPreviewLoading(false);
    };

    const getReportForm = (reportTypeId) => {
        if (reportTypeId == reportTypesIds.CONCRETE_CYLINDERS) {
            return <ConcreteCylindersEditLayout isReportItemLayout={true} />;
        }

        if (reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP) {
            return <SoilMoistureDensityRelationshipEditLayout isReportItemLayout={true} />
        }

        if (reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E) {
            return <SoilMoistureDensityRelationshipMethodBEditLayout isReportItemLayout={true} />
        }

        if (reportTypeId == reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING) {
            return <SoilInPlaceDensityTestingEditLayout isReportItemLayout={true} />
        }

        if (reportTypeId == reportTypesIds.CONCRETE_POST_TENSION_INSPECTION) {
            return <ConcretePostTenstionInspectionEditLayout />
        }

        return <ReportViewer />;
    }

    return (
        <div className="report-item-tabs-wrapper">
            <Tabs type="card">
                <TabPane tab="Report" key="1">
                    <Button
                        className='report-notification-action-button'
                        loading={isPreviewLoading}
                        onClick={onPreview}
                        type="primary"
                        icon={<EyeOutlined />}>
                        Preview
                    </Button>
                    <Popconfirm placement="top" title={strings.COMMON.REPORT_APPROVE} onConfirm={() => approveReport(dispatchRequestWorkOrderId)} okText={strings.COMMON.OK} cancelText={strings.COMMON.CANCEL}>
                        <Switch
                            checkedChildren="Approved"
                            unCheckedChildren="Not approved"
                            checked={props.editingReport.isApproved}
                            disabled={props.editingReport.isApproved}
                        />
                    </Popconfirm>
                    {getReportForm(reportTypeId)}
                </TabPane>
                <TabPane tab="Billing" key="2">
                    <InvoicePage isReportItemLayout={true} />
                </TabPane>
            </Tabs>
            <div style={{ position: "absolute", left: "-3999px" }}>
                <div id={REPORT_LAYOUT_PREVIEW_DIV_ID} ref={reportRef}></div>
            </div>
        </div>
    )
}

const mapState = ({ reportList, reports, invoice }) => {
    return {
        reportListSearchRequest: reportList.reportListSearchRequest,
        paginatedReportList: reportList.paginatedReportList,
        editingReportFormData: reports.editingReportFormData,
        editingReport: reports.editingReport,
        reportTestsData: reports.reportTestsData,
        invoiceSearchRequest: invoice.invoiceSearchRequest
    };
}

const mapDispatch = (dispatch) => {
    return {
        setInvoiceSearchRequestFilterProps(criteria, values) {
            dispatch(invoiceActions.setInvoiceSearchRequestFilterProps(criteria, values));
        },
        approveEditingReport() {
            dispatch(reportsActions.approveEditingReport());
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setPaginatedInvoice(data) {
            dispatch(invoiceActions.setPaginatedInvoice(data));
        },
    }
}

export default connect(mapState, mapDispatch)(ReportItemLayout);