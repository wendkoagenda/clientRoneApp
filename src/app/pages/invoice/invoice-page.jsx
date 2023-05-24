import React, { useCallback, useEffect, useState, useRef } from "react";
import { connect } from 'react-redux';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions, DEFAULT_PAGE_NUMBER, invoiceFilterProps, orderProps } from './invoice.reducer';
import {
    Col,
    notification,
    Row,
    Tree,
    Button,
    Pagination,
    Skeleton,
    DatePicker,
    Input, 
    Tooltip,
    Empty,
    BackTop,
    Checkbox
} from 'antd';
import { TrackingService } from "../../services";
import { getErrorMessage } from "../../services/tracking.service";
import { strings, pageNumbers, invoiceOrderStatusesWithNames } from "../../constants";
import InvoiceService from "../../services/invoice.service";
import {
    DownOutlined,
    PlusOutlined,
    MinusOutlined
} from '@ant-design/icons';
import { CustomSingleOptionSelect } from '../../components/common';
import moment from "moment";
import { invoiceExtraMetricDescription, invoiceOrderStatuses, metricInvoiceStatuses } from "../../constants/invoice-order-statuses";
import html2pdf from "html2pdf.js/src";
import PreviewInvoiceModal from "./preview-invoice.modal";
import CreateInvoiceModal from "./create-invoice.modal";
import history from '../../history';

const { RangePicker } = DatePicker;

export const CLIENT_ID_TEMPLATE = 'clientId_';
export const CLIENT_TEMPLATE = 'client_';
export const PROJECT_ID_TEMPLATE = 'projectId_';
export const WORK_ORDER_ID_TEMPLATE = 'dispatchRequestWorkOrderId_';
export const NEW_WORK_ORDER_ID_TEMPLATE = 'NO-';
export const METRIC_ID_TEMPLATE = 'metricId_';
const INVOICE_PREVIEW_DIV_ID = 'pdf-doc-elem';
const SUM_OF_TOTAL_ID_TEMPLATE = 'sumOfTotalId';

const headerStyle = {
    'hover': {
        background: 'inherit !important'
    }
}

const validateStyle = {
    boxShadow: 'none',
    borderRadius: '5px',
    border: '2px solid red'
}

const InvoicePage = (props) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [halfCheckedKeys, setHalfCheckedKeys] = useState([]);
    const [invoiceModel, setInvoiceModel] = useState();
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [addButtonCounter, setAddButtonCounter] = useState(0);
    const [downloadFunction, setDownloadFunction] = useState();
    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [previewFile, setPreviewFile] = useState();
    const [invoicePdf, setInvoicePdf] = useState();

    const invoiceRef = useRef();

    const {
        paginatedInvoice,
        invoiceSearchRequest,
        setPaginatedInvoice,
        changeOrderProperty,
        setPageInfo,
        setGlobalSpinState,
        changePage,
        setFilterProps,
        filterProps,
        setInvoiceSearchRequestFilterProps,
        isGlobalSpinActive,
        setInvoiceSearchRequestDateRange,
        setInitialInvoiceSearchRequest,
        addNewOrder,
        removeNewOrder,
        changeMetricProperty,
        setInvoiceGenerateResponse,
        isReportItemLayout,
        invoiceGenerateResponse
    } = props;

    const setInitialPageState = () => {
        window.scrollTo(0, 0);
        setUploadModalVisible(false);
        setCheckedKeys([]);
        setHalfCheckedKeys([]);
        setInvoiceModel([]);
        setExpandedKeys([]);
    }

    const loadInvoiceList = useCallback(async () => {
        setGlobalSpinState(true);
        try {
            const invoiceResponse = await InvoiceService.searchInvoiceByRequest(invoiceSearchRequest);
            setPaginatedInvoice(invoiceResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.LOAD_INVOICE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }, [invoiceSearchRequest, setGlobalSpinState, setPaginatedInvoice]);

    const loadSearchFilters = useCallback(async () => {
        setGlobalSpinState(true);
        try {
            const filtersResponse = await InvoiceService.getSearchFilters();
            setFilterProps(filtersResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.LOAD_FILTERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }, [setFilterProps, setGlobalSpinState])

    useEffect(() => {
        loadSearchFilters();
        if (isReportItemLayout) {
            loadInvoiceList();
        }
    }, [isReportItemLayout, loadInvoiceList, loadSearchFilters])

    useEffect(() => {
        setPageInfo(strings.PAGES.INVOICE, pageNumbers.INVOICE);

        return () => {
            setInitialInvoiceSearchRequest();
        }
    }, [setInitialInvoiceSearchRequest, setPageInfo])

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
    };

    const onCheck = (checkedKeysValue, e) => {
        const triggeredNodeClassName = e.nativeEvent.path[0].className;
        const nodeKey = e.node.key;
        if (triggeredNodeClassName == 'ant-tree-checkbox-inner' || triggeredNodeClassName == 'ant-tree-checkbox ant-tree-checkbox-checked') {
            const filteredHalfKeys = e.halfCheckedKeys.filter(item => !item.includes(WORK_ORDER_ID_TEMPLATE));
            if (nodeKey.includes(WORK_ORDER_ID_TEMPLATE) && !nodeKey.includes(METRIC_ID_TEMPLATE) && !e.node.checked) {
                let workOrder = null;
                const dispatchRequestWorkOrderId = nodeKey.replace(WORK_ORDER_ID_TEMPLATE, '');
                paginatedInvoice.data?.forEach(client => {
                    client.projects?.forEach(project => {
                        project.workOrders?.forEach(w => {
                            if (w.dispatchRequestWorkOrderId == dispatchRequestWorkOrderId) {
                                workOrder = w;
                            }
                        })
                    })
                });

                const metricsIds = workOrder.invoiceExtraMetrics?.map(metric => `${WORK_ORDER_ID_TEMPLATE}${workOrder.dispatchRequestWorkOrderId}${METRIC_ID_TEMPLATE}${metric.id}`);
                if (metricsIds) {
                    setCheckedKeys([...checkedKeysValue, ...metricsIds].filter((v, i, a) => a.indexOf(v) === i));
                    setHalfCheckedKeys(filteredHalfKeys);
                }
            } else {
                setCheckedKeys(checkedKeysValue);
                setHalfCheckedKeys(filteredHalfKeys);
            }
        }
    };

    const handleSave = async () => {
        try {
            let validationError = false;
            const mergedKeys = [...halfCheckedKeys, ...checkedKeys];

            const checkedClientKeys = mergedKeys.filter(item => item.includes(CLIENT_ID_TEMPLATE)).map(item => {
                return Number(item.replace(CLIENT_ID_TEMPLATE, ''))
            });

            const checkedProjectKeys = mergedKeys.filter(item => (item.includes(CLIENT_TEMPLATE) && item.includes(PROJECT_ID_TEMPLATE))).map(item => {
                return Number(item.replace(new RegExp(CLIENT_TEMPLATE + '[0-9]+' + PROJECT_ID_TEMPLATE, 'g'), ''))
            });

            const checkedWorkOrdersKeys = mergedKeys.filter(item => item.includes(WORK_ORDER_ID_TEMPLATE)).map(item => {
                return Number(item.replace(WORK_ORDER_ID_TEMPLATE, ''))
            }).concat(mergedKeys.filter(item => item.includes(NEW_WORK_ORDER_ID_TEMPLATE)).map(item => {
                return item.replace(WORK_ORDER_ID_TEMPLATE, '')
            }));

            const checkedMetricKeys = mergedKeys.filter(item => item.includes(METRIC_ID_TEMPLATE)).map(item => {
                return Number(item.replace(new RegExp(WORK_ORDER_ID_TEMPLATE + '[0-9]+' + METRIC_ID_TEMPLATE, 'g'), ''))//item.replace(METRIC_ID_TEMPLATE, '')
            });

            const filteredData = {
                clients: paginatedInvoice.data.filter(client => checkedClientKeys.some(i => i == client.id)).map(client => {
                    return {
                        ...client,
                        projects: client.projects.filter(project => checkedProjectKeys.some(i => i == project.id))
                        .filter(project => project.number.length == 7)
                        .map(project => {
                            return {
                                ...project,
                                workOrders: project.workOrders.filter(order => (checkedWorkOrdersKeys.some(i => i == order.dispatchRequestWorkOrderId) ||
                                    order.invoiceExtraMetrics.some(metric => checkedMetricKeys.some(i => i == metric.id)))).map(order => {
                                        if ((typeof order.dispatchRequestWorkOrderId === 'string' || order.dispatchRequestWorkOrderId instanceof String)
                                            && order.dispatchRequestWorkOrderId.startsWith(NEW_WORK_ORDER_ID_TEMPLATE)) {
                                            if (order.title.length == 0 || order.actualEndDate.length == 0) {
                                                notification['warning']({
                                                    message: strings.INVOICE.ERRORS.EMPTY_FIELDS,
                                                });
                                                validationError = true;
                                            } else {
                                                return {
                                                    ...order,
                                                    invoiceStatusId: 4, //setting invoice to status to be ready to invoice
                                                    dispatchRequestWorkOrderId: 0,
                                                    total: order.total ? order.total : undefined
                                                };
                                            }
                                        } else {
                                            return {
                                                ...order,
                                                invoiceStatusId: 4, //setting invoice to status to be ready to invoice
                                                isIncluded: checkedWorkOrdersKeys.some(i => i == order.dispatchRequestWorkOrderId),
                                                invoiceExtraMetrics: order.invoiceExtraMetrics.filter(metric => checkedMetricKeys.some(i => i == metric.id))
                                            }
                                        }
                                    })
                            }
                        })
                    }
                })
            }

            if (validationError) {
                return;
            }

            setGlobalSpinState(true);
            const invoiceGenerateResponse = await InvoiceService.generateInvoice(filteredData);
            setInvoiceGenerateResponse(invoiceGenerateResponse.data.data);
            previewDataFromInvoice(invoiceGenerateResponse.data.data[0]);
            setInvoiceModel(filteredData);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.PREVIEW_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }

    const saveChanges = async () => {
        const invoiceInfo = paginatedInvoice.paginatedData.flatMap(client =>
            client.projects.flatMap(project =>
                project.workOrders.map(workOrder => {
                    return {
                        ...workOrder
                    }
                })
            )
        )

        try {
            if (invoiceInfo.length > 0) {
                const uploadResponse = await InvoiceService.updateInvoiceInfo(invoiceInfo);
                if (uploadResponse.status == 200) {
                    notification['success']({
                        message: strings.INVOICE.LABELS.UPDATE_INVOICE_INFO,
                    });
                    setInitialPageState();
                    await loadInvoiceList();
                }
            }
            else {
                notification['warning']({
                    message: strings.INVOICE.ERRORS.UNABLE_TO_UPDATE_INVOICE_INFO,
                });
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UPDATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
            TrackingService.trackException(error);
        }
    }

    const previewDataFromInvoice = async (data) => {
        document.getElementById(INVOICE_PREVIEW_DIV_ID).innerHTML = data.fileContent;
        var element = document.getElementById(INVOICE_PREVIEW_DIV_ID);

        var options = {
            margin: [0, 10, 0, 10],
            filename: `invoice-${moment().toLocaleString()}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 1 },
            jsPDF: { format: 'a4' },
            pagebreak: { after: '.page' }
        };

        const outputPreviewPdf = await html2pdf().set(options).from(element).toPdf().outputPdf();
        setPreviewFile(btoa(outputPreviewPdf));

        html2pdf().set(options).from(element).toPdf().get('pdf').then(pdf => {
            const totalPages = pdf.internal.getNumberOfPages();
            pdf.deletePage(totalPages);
        }).output("blob").then(pdfFile => setInvoicePdf(pdfFile));

        setDownloadFunction(() => () => {
            html2pdf().set(options).from(element).toPdf().get('pdf').then(pdf => {
                const totalPages = pdf.internal.getNumberOfPages();
                pdf.deletePage(totalPages);
            }).save();
        })

        setUploadModalVisible(true);
    }

    const renderClientRow = (company) => (
        <div className="client-label">
            <p className="client-name">{company}</p>
        </div>
    )

    const renderProjectRow = (project) => (
        <Row className="project-row">
            <Col span={8}>
                <span>{strings.INVOICE.LABELS.PROJECT_NUMBER}</span>
                <p>{project.number}</p>
            </Col>
            <Col span={8}>
                <span>{strings.INVOICE.LABELS.PROJECT_NAME}</span>
                <p>{project.name}</p>
            </Col>
            <Col span={8}>
                <span>{strings.INVOICE.LABELS.PROJECT_MANAGER}</span>
                <p>{project.projectManager?.fullName}</p>
            </Col>
        </Row>
    )

    const handleAddRowButton = (clientId, projectId) => {
        setAddButtonCounter(prev => prev + 1);
        addNewOrder(clientId, projectId, addButtonCounter);
    }

    const tableHeader = (clientId, projectId) => (
        <div className="header-wrapper">
            <PlusOutlined onClick={() => handleAddRowButton(clientId, projectId)} />
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

    const renderNewOrderRow = (order, clientId, projectId, workOrderId) => (
        <Row className="work-order-row" align="center">
            <Col span={3}>
                <DatePicker
                    onChange={(date) => changeOrderProperty(orderProps.DATE, date, clientId, projectId, workOrderId)}
                    allowClear={false}
                    suffixIcon={null}
                    format={strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT}
                    placeholder={''}
                    disabled={order?.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    style={order?.actualEndDate?.length == 0 ? validateStyle : {}}
                    value={order?.actualEndDate}
                />
            </Col>
            <Col span={2}>
                <p>{invoiceOrderStatusesWithNames.find(item => item.id === order?.invoiceStatusId)?.name}</p>
            </Col>
            <Col span={3}>
                <p>{order?.dispatchRequestWorkOrderId}</p>
            </Col>
            <Col span={2}>
                <Input
                    disabled={order?.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.billingCode}
                    onBlur={(e) => changeOrderProperty(orderProps.BILLING_CODE, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={6}>
                <Input
                    disabled={order?.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.title}
                    style={order?.title.length == 0 ? validateStyle : {}}
                    onBlur={(e) => changeOrderProperty(orderProps.TITLE, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={3}>
                <Input
                    disabled={order?.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.quantity}
                    type="number"
                    onBlur={(e) => changeOrderProperty(orderProps.QUANTITY, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={3}>
                <Input
                    disabled={order?.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.rate}
                    type="number"
                    onBlur={(e) => changeOrderProperty(orderProps.RATE, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={1}>
                <p>{!isNaN(order?.total) && order?.total}</p>
            </Col>
            <Col span={1}>
                <MinusOutlined onClick={() => removeNewOrder(clientId, projectId, workOrderId)} />
            </Col>
        </Row>
    )

    const renderWorkOrderRow = (order, clientId, projectId, workOrderId) => (
        <Row className="work-order-row" align="center">
            <Col span={3} style={{ paddingLeft: '11px' }}>
                <p>{moment(order?.startDate).convertToEST().format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT)}</p>
            </Col>
            <Col span={2}>
                <p>{invoiceOrderStatusesWithNames.find(item => item.id === order.invoiceStatusId)?.name}</p>
            </Col>
            <Col span={3}>
                <p>{order?.dispatchRequestWorkOrderId}</p>
            </Col>
            <Col span={2}>
                <p>{order?.billingCode}</p>
            </Col>
            <Col span={6}>
                <p>{order?.title}</p>
            </Col>
            <Col span={3}>
                <Input
                    disabled={order.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.quantity}
                    type="number"
                    onBlur={(e) => changeOrderProperty(orderProps.QUANTITY, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={3}>
                <Input
                    disabled={order.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE}
                    defaultValue={order?.rate}
                    type="number"
                    onBlur={(e) => changeOrderProperty(orderProps.RATE, e.target.value, clientId, projectId, workOrderId)}
                />
            </Col>
            <Col span={2}>
                <p style={{ paddingLeft: '18px' }}>{order?.total}</p>
            </Col>
        </Row>
    )

    const renderMetricRow = (metric, clientId, projectId, workOrderId) => (
        <Row className="metric-row">
            <Col span={5}>
                <p>{metricInvoiceStatuses.find(item => item.value === metric.isInvoiced).name}</p>
            </Col>
            <Col span={4} offset={3}>
                <p>{invoiceExtraMetricDescription.find(item => item.id === metric.invoiceExtraMetricDescriptionId).name}</p>
            </Col>
            <Col span={3} offset={3}>
                <Input
                    disabled={metric.isInvoiced}
                    defaultValue={metric?.quantity}
                    type="number"
                    style={{ marginLeft: '-0.4vw' }}
                    onBlur={(e) => changeMetricProperty(orderProps.QUANTITY, e.target.value, clientId, projectId, workOrderId, metric.id)}
                />
            </Col>
            <Col span={3} offset={1}>
                <Input
                    disabled={metric.isInvoiced}
                    defaultValue={metric?.rate}
                    type="number"
                    style={{ marginLeft: '-2.1vw' }}
                    onBlur={(e) => changeMetricProperty(orderProps.RATE, e.target.value, clientId, projectId, workOrderId, metric.id)}
                />
            </Col>
            <Col span={2}>
                <p style={{}}>{metric?.total}</p>
            </Col>
        </Row>
    )

    const renderSumOfTotalRow = (project) => (
        <Row className="sum-of-total-row">
            <Col>
                <p>{strings.INVOICE.LABELS.SUM_OF_TOTAL} {!isNaN(project?.sumOfTotal) && project?.sumOfTotal}</p>
            </Col>
        </Row>
    )

    const treeData = paginatedInvoice.paginatedData.map(client => {
        return {
            title: renderClientRow(client.company),
            key: `${CLIENT_ID_TEMPLATE}${client.id}`,
            children: client.projects?.map(project => {
                return {
                    title: renderProjectRow(project),
                    key: `${CLIENT_TEMPLATE}${client.id}${PROJECT_ID_TEMPLATE}${project.id}`,
                    children: [{
                        key: `${client.id}_${project.id}_header`,
                        checkable: false,
                        style: headerStyle,
                        title: tableHeader(client.id, project.id)
                    }, ...project.workOrders?.map(workOrder => {
                        return [{
                            title: workOrder.isNewOrder ? renderNewOrderRow(workOrder, client.id, project.id, workOrder.dispatchRequestWorkOrderId) : renderWorkOrderRow(workOrder, client.id, project.id, workOrder.dispatchRequestWorkOrderId),
                            key: `${WORK_ORDER_ID_TEMPLATE}${workOrder.dispatchRequestWorkOrderId}`,
                            disabled: workOrder.invoiceStatusId !== invoiceOrderStatuses.READY_TO_INVOICE
                        }, ...(
                            workOrder.invoiceExtraMetrics ? workOrder.invoiceExtraMetrics.map(metric => {
                                return {
                                    key: `${WORK_ORDER_ID_TEMPLATE}${workOrder.dispatchRequestWorkOrderId}${METRIC_ID_TEMPLATE}${metric.id}`,
                                    disabled: metric.isInvoiced,
                                    style: { alignSelf: 'end' },
                                    title: renderMetricRow(metric, client.id, project.id, workOrder.dispatchRequestWorkOrderId)
                                }
                            }) : []
                        )]
                    }), ...client.projects?.filter(element => element.id == project.id).map(project => {
                        return {
                            title: renderSumOfTotalRow(project),
                            key: `${SUM_OF_TOTAL_ID_TEMPLATE}${project.id}`,
                            checkable: false
                        }
                    })].flat(1)
                }
            })
        }
    })

    let getAllKeys = (tree) => {
        let result = [];
        tree.forEach((x) => {
          let childKeys = [];
          if (x.children) {
            childKeys = getAllKeys(x.children);
          }
    
          result.push(...[x.key, ...childKeys]);
        });
    
        return result;
      };
    
      const allKeys = getAllKeys(treeData);
    
      const onChangeSelectAll = () => {
        if (checkedKeys.length === allKeys.length) {
          setCheckedKeys([]);
        } else {
          setCheckedKeys(allKeys);
        }
      };

    return (
        <React.Fragment>
            <div className="client-list-layout" style={{ flexDirection: 'column', paddingBottom: '30px' }}>
                {!isReportItemLayout && (
                    <div className="filter-header">
                        {
                            Object.values(invoiceFilterProps).map(value => {
                                return (
                                    <CustomSingleOptionSelect
                                        key={value.PROP_NAME}
                                        placeholder={value.PLACEHOLDER}
                                        dropdownClassName="report-type-dropdown"
                                        mode='multiple'
                                        value={invoiceSearchRequest[value.PROP_NAME]}
                                        maxTagCount='responsive'
                                        options={filterProps[value.FILTER_PROP_NAME]}
                                        handleChange={(values) => setInvoiceSearchRequestFilterProps(value.PROP_NAME, values)}
                                    />
                                )
                            })
                        }
                        <RangePicker onChange={(values) => setInvoiceSearchRequestDateRange(values)} />
                        <Button type="primary" onClick={loadInvoiceList}>
                            {strings.INVOICE.LABELS.SUBMIT_FILTERS}
                        </Button>
                        <Tooltip title={strings.INVOICE.LABELS.REMOVE_FILTERS}>
                            <PlusOutlined onClick={setInitialInvoiceSearchRequest} />
                        </Tooltip>
                    </div>
                )}
                <div className="invoice-table">
                    {!isGlobalSpinActive ?
                        <React.Fragment>
                            <Checkbox
                                onChange={onChangeSelectAll}
                                checked={checkedKeys.length === allKeys.length && allKeys.length !== 0 
                                    ? true 
                                    : false}
                                className="select-all-btn"
                            >
                                Select all
                            </Checkbox>
                            {treeData.length > 0 ? (
                                <Tree
                                    checkable
                                    onExpand={onExpand}
                                    expandedKeys={isReportItemLayout ? [treeData[0].key, treeData[0].children[0].key] : expandedKeys}
                                    onCheck={onCheck}
                                    //checkStrictly
                                    checkedKeys={{
                                        checked: checkedKeys,
                                        halfChecked: halfCheckedKeys
                                    }}
                                    switcherIcon={<DownOutlined />}
                                    treeData={treeData}
                                    selectable={false}
                                />
                            ) : (
                                <Empty style={{ marginLeft: '44%' }} />
                            )}
                        </React.Fragment> : (
                            <Skeleton active />
                        )}
                </div>
                <div className="pagination-wrapper">
                    <Pagination
                        simple={true}
                        defaultCurrent={1}
                        current={paginatedInvoice.current}
                        total={paginatedInvoice.recordsCount}
                        pageSize={DEFAULT_PAGE_NUMBER}
                        onChange={(page, _pageSize) => changePage(page)}
                    />
                </div>
                <div className="footer-actions">
                    <Button className="save-changes" type="primary" onClick={saveChanges}>
                        {strings.COMMON.SAVE_CHANGES}
                    </Button>
                    <Button type="primary" onClick={() => history.goBack()}>
                        {strings.INVOICE.LABELS.CANCEL}
                    </Button>
                    <Button type="primary" onClick={handleSave}>
                        {strings.INVOICE.LABELS.SAVE}
                    </Button>
                </div>
            </div>
            <div className="pdf-doc-wrapper">
                <div id={INVOICE_PREVIEW_DIV_ID} style={{ fontSize: '18px' }} ref={invoiceRef}></div>
            </div>
            <CreateInvoiceModal
                visible={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                onDownload={downloadFunction}
                onPreview={() => setPreviewExpanded(true)}
                invoiceModel={invoiceModel}
                invoicePdf={invoicePdf}
                setInitialPageState={setInitialPageState}
                loadInvoiceList={loadInvoiceList}
                divId={INVOICE_PREVIEW_DIV_ID}
                setPreviewFile={setPreviewFile}
            />
            <PreviewInvoiceModal
                previewExpanded={previewExpanded}
                setPreviewExpanded={setPreviewExpanded}
                previewFile={previewFile}
                invoiceGenerateResponse={invoiceGenerateResponse}
            />
            <BackTop />
        </React.Fragment>
    )
}

const mapState = ({ invoice, authorizedLayout }) => {
    return {
        allSites: authorizedLayout.allSites,
        paginatedInvoice: invoice.paginatedInvoice,
        invoiceSearchRequest: invoice.invoiceSearchRequest,
        filterProps: invoice.filterProps,
        isGlobalSpinActive: authorizedLayout.isGlobalSpinActive,
        invoiceGenerateResponse: invoice.invoiceGenerateResponse
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setPaginatedInvoice(data) {
            dispatch(actions.setPaginatedInvoice(data));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        changeOrderProperty(property, value, clientId, projectId, workOrderId) {
            dispatch(actions.changeOrderProperty({ property, value, clientId, projectId, workOrderId }));
            dispatch(actions.updateInvoiceExtraMetricsTotal());
        },
        changeMetricProperty(property, value, clientId, projectId, workOrderId, metricId) {
            dispatch(actions.changeMetricProperty({ property, value, clientId, projectId, workOrderId, metricId }));
            dispatch(actions.updateInvoiceExtraMetricsTotal());
        },
        changePage(value) {
            dispatch(actions.changePage(value));
        },
        setInitialInvoiceSearchRequest() {
            dispatch(actions.setInitialInvoiceSearchRequest());
        },
        setFilterProps(values) {
            dispatch(actions.setFilterProps(values));
        },
        setInvoiceSearchRequestFilterProps(criteria, values) {
            dispatch(actions.setInvoiceSearchRequestFilterProps(criteria, values));
        },
        setInvoiceSearchRequestDateRange(values) {
            dispatch(actions.setInvoiceSearchRequestDateRange(values));
        },
        addNewOrder(clientId, projectId, addCount) {
            dispatch(actions.addNewOrder({ clientId, projectId, addCount }));
        },
        removeNewOrder(clientId, projectId, dispatchRequestWorkOrderId) {
            dispatch(actions.removeNewOrder({ clientId, projectId, dispatchRequestWorkOrderId }));
        },
        setInvoiceGenerateResponse(values) {
            dispatch(actions.setInvoiceGenerateResponse(values));
        }
    }
}

export default connect(mapState, mapDispatch)(InvoicePage);