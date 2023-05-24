import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux'
import { Button, notification } from 'antd';
import { useParams } from 'react-router';
import { actions as invoiceActions } from '../invoice/invoice.reducer';
import { actions as reportsActions } from '../reports/reports-reducer';
import { reportTypesIds, strings } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import { CustomerPortalService, TrackingService } from '../../services';
import { useReactToPrint } from 'react-to-print';
import { handleInjectedScripts } from '../../helpers/project-report-data-helper';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import {
    EyeOutlined
} from "@ant-design/icons";
import CustomerReportViewer from '../customer-reports/report-viewer';
import CustomerConcreteCylindersEditLayout from '../customer-reports/customer-concrete-cylinders-layout';
import CustomerSoilMoistureDensityRelationshipEditLayout from '../customer-reports/soil-moisture-density-relationship-edit-layout';
import CustomerSoilMoistureDensityRelationshipMethodBEditLayout from '../customer-reports/soil-moisture-density-relationship-method-b-edit-layout'
import CustomerSoilInPlaceDensityTestingEditLayout from '../customer-reports/soil-in-place-density-testing-edit-layout';
import { updateFooter } from '../../helpers/report-paginator';

const CustomerReportItemLayout = (props) => {

    const {
        setInvoiceSearchRequestFilterProps,
    } = props;

    const reportRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        onBeforePrint: () => setIsPreviewLoading(false),
        onAfterPrint: () => document.getElementById("pdf-doc-elem").innerHTML = ''
    });

    const { dispatchRequestWorkOrderId, reportTypeId } = useParams();
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const setWorkOrderId = useCallback(() => {
        setInvoiceSearchRequestFilterProps('dispatchRequestWorkOrderIds', [dispatchRequestWorkOrderId]);
    }, [dispatchRequestWorkOrderId, setInvoiceSearchRequestFilterProps])

    useEffect(() => {
        setWorkOrderId();
    }, [dispatchRequestWorkOrderId, setWorkOrderId])

    const onPreview = async () => {
        setIsPreviewLoading(true);
        try {
            const responseFile = await CustomerPortalService.previewReport({
                dispatchRequestWorkOrderId,
                jsonData: props.editingReportFormData,
                specimens: props.reportTestsData

            });
            document.getElementById("pdf-doc-elem").innerHTML = responseFile.data;
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
            return <CustomerConcreteCylindersEditLayout isReportItemLayout={true} />;
        }

        if (reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP) {
            return <CustomerSoilMoistureDensityRelationshipEditLayout isReportItemLayout={true} />
        }

        if (reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E) {
            return <CustomerSoilMoistureDensityRelationshipMethodBEditLayout isReportItemLayout={true} />
        }

        if (reportTypeId == reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING) {
            return <CustomerSoilInPlaceDensityTestingEditLayout isReportItemLayout={true} />
        }

        return <CustomerReportViewer />;
    }

    return (
        <div className="report-item-tabs-wrapper">

                    <Button
                        className='report-notification-action-button'
                        loading={isPreviewLoading}
                        onClick={onPreview}
                        type="primary"
                        icon={<EyeOutlined />}>
                        Preview
                    </Button>
                    {getReportForm(reportTypeId)}
            
            <div style={{ position: "absolute", left: "-3999px" }}>
                <div id="pdf-doc-elem" ref={reportRef}></div>
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

export default connect(mapState, mapDispatch)(CustomerReportItemLayout);