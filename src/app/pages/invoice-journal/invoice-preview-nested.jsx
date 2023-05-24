import { Col, notification, Row, Spin, Tree } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import { strings } from '../../constants';
import { invoiceExtraMetricDescription, invoiceOrderStatuses, metricInvoiceStatuses } from '../../constants/invoice-order-statuses';
import { TrackingService, InvoiceService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { calculateExtraMetricTotal } from '../../helpers/math-helper';
import { CLIENT_ID_TEMPLATE, CLIENT_TEMPLATE, METRIC_ID_TEMPLATE, PROJECT_ID_TEMPLATE, WORK_ORDER_ID_TEMPLATE } from '../invoice/invoice-page';

const InvoicePreviewNested = ({
    invoiceId
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [treeData, setTreeData] = useState([]);

    const renderClientRow = (client) => (
        <Col span={24} className="client-label">
            <p className="client-name">{client.company}</p>
        </Col>
    )

    const headerStyle = {
        'hover': {
            background: 'inherit !important'
        }
    }

    const renderProjectRow = (project) => (
        <Row className="project-row">
            <Col span={8}>
                <span className="row-label">{strings.INVOICE.LABELS.PROJECT_NUMBER}</span>
                <span className="row-value">{project.number}</span>
            </Col>
            <Col span={8}>
                <span className="row-label">{strings.INVOICE.LABELS.PROJECT_NAME}</span>
                <span className="row-value">{project.name}</span>
            </Col>
            <Col span={8}>
                <span className="row-label">{strings.INVOICE.LABELS.PROJECT_MANAGER}</span>
                <span className="row-value">{project.projectManager?.fullName}</span>
            </Col>
        </Row>
    )

    const renderWorkOrderRow = (workOrder) => (
        <Row className="work-order-row" align="center">
            <Col span={3} style={{ paddingLeft: '11px' }}>
                <p>{workOrder?.startDate?.toUTCKind().convertToEST().format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT)}</p>
            </Col>
            <Col span={2}>
                <p>{workOrder?.invoiceStatus}</p>
            </Col>
            <Col span={3}>
                <p>{workOrder?.dispatchRequestWorkOrderId}</p>
            </Col>
            <Col span={2}>
                <p>{workOrder?.billingCode}</p>
            </Col>
            <Col span={6}>
                <p>{workOrder?.title}</p>
            </Col>
            <Col span={3}>
                <p>
                    {workOrder?.quantity}
                </p>
            </Col>
            <Col span={3}>
                <p>
                    {workOrder?.rate}
                </p>
            </Col>
            <Col span={2}>
                <p>{workOrder?.total}</p>
            </Col>
        </Row>
    )

    const tableHeader = () => (
        <div className="header-wrapper">
            <Row className="work-orders-table-header">
                <Col span={3}>
                    <p>{strings.INVOICE.LABELS.DATE}</p>
                </Col>
                <Col span={2}>
                    <p>{strings.INVOICE.LABELS.STATUS}</p>
                </Col>
                <Col span={3}>
                    <p>{strings.INVOICE.LABELS.DISPATCH}</p>
                </Col>
                <Col span={2}>
                    <p>{strings.INVOICE.LABELS.BILLING}</p>
                </Col>
                <Col span={6}>
                    <p>{strings.INVOICE.LABELS.DESCRIPTION}</p>
                </Col>
                <Col span={3}>
                    <p>{strings.INVOICE.LABELS.QTY}</p>
                </Col>
                <Col span={3}>
                    <p>{strings.INVOICE.LABELS.RATE}</p>
                </Col>
                <Col span={2}>
                    <p>{strings.INVOICE.LABELS.TOTAL}</p>
                </Col>
            </Row>
        </div>
    )

    const renderMetricRow = (metric) => (
        <Row className="metric-row">
            <Col span={2} offset={3}>
                <p>{metricInvoiceStatuses.find(item => item.value === metric.isInvoiced).name}</p>
            </Col>
            <Col span={6} offset={5}>
                <p>{invoiceExtraMetricDescription.find(item => item.id === metric.invoiceExtraMetricDescriptionId).name}</p>
            </Col>
            <Col span={3}>
                <p>
                    {metric?.quantity}
                </p>
            </Col>
            <Col span={3}>
                <p>
                    {metric?.rate}
                </p>
            </Col>
            <Col span={2}>
                <p>{calculateExtraMetricTotal(metric?.quantity, metric?.rate)}</p>
            </Col>
        </Row>
    )

    const loadInvoiceData = useCallback(async () => {
        try {
            const invoiceResponse = await InvoiceService.getInvoiceById(invoiceId);
            const treeData = invoiceResponse.data.data.clients.map(client => {
                return {
                    title: renderClientRow(client),
                    key: `${CLIENT_ID_TEMPLATE}${client.id}`,
                    children: client.projects?.map(project => {
                        return {
                            title: renderProjectRow(project),
                            key: `${CLIENT_TEMPLATE}${client.id}${PROJECT_ID_TEMPLATE}${project.id}`,
                            children: [{
                                key: `${client.id}_${project.id}_header`,
                                checkable: false,
                                style: headerStyle,
                                title: tableHeader()
                            }, ...project.workOrders?.map(workOrder => {
                                return [{
                                    title: renderWorkOrderRow(workOrder),
                                    key: `${WORK_ORDER_ID_TEMPLATE}${workOrder.dispatchRequestWorkOrderId}`,
                                    disabled: workOrder.invoiceStatusId === invoiceOrderStatuses.READY_TO_INVOICE,
                                }, ...workOrder.invoiceExtraMetrics.map(metric => {
                                    return {
                                        key: `${WORK_ORDER_ID_TEMPLATE}${workOrder.dispatchRequestWorkOrderId}${METRIC_ID_TEMPLATE}${metric.id}`,
                                        disabled: !metric.isInvoiced,
                                        title: renderMetricRow(metric)
                                    }
                                })]
                            })].flat(1)
                        }
                    })
                }
            });

            setTreeData(treeData);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_LOAD_INVOICE_PREVIEW);
            notification['error']({
                message: errorMessage
            });
        }
    }, [invoiceId]);

    useEffect(() => {
        setIsLoading(true);
        loadInvoiceData().then(() => {
            setIsLoading(false);
        });
    }, [loadInvoiceData]);

    return (
        <>
            {
                isLoading ? (
                    <div style={{ "width": "100%" }}>
                        <Spin style={{ "paddingLeft": "48%" }} />
                    </div>
                ) : (
                    <Tree
                        defaultExpandAll={true}
                        treeData={treeData} />
                )
            }
        </>
    );
}

export default InvoicePreviewNested;