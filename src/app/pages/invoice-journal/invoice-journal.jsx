import React, { useCallback, useEffect, useState } from "react";
import { connect } from 'react-redux';
import { strings } from "../../constants";
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './invoice-journal.reducer';
import TextCrop from '../../components/common/text-crop';
import {
    CloseCircleOutlined,
    DownloadOutlined,
    EyeOutlined,
    UserOutlined,
    FileOutlined,
    FieldTimeOutlined,
    FileDoneOutlined,
    FilterOutlined,
    RollbackOutlined,
    RetweetOutlined,
    UpOutlined,
    DownOutlined
} from '@ant-design/icons';
import { Button, notification, Table, DatePicker, List, Popconfirm, Radio, Modal, BackTop } from "antd";
import { InvoiceJournalService, TrackingService } from "../../services";
import { getErrorMessage } from "../../services/tracking.service";
import { invoiceManageStatuses } from "../../constants/invoice-manage-statuses";
import { invoicePageViewModes } from "../../constants/invoice-manage-view-modes";
import { CustomBtn } from "../../components/common";
import { downloadFileFromFileResponse } from '../../helpers/file-download-helper';
import { Document, Page, pdfjs } from "react-pdf";
import InvoicePreviewNested from "./invoice-preview-nested";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const { RangePicker } = DatePicker;

const InvoiceJournalPage = (props) => {
    const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
    const [previewState, setPreviewState] = useState({
        previewExpanded: false,
        numPages: null,
        previewFile: null
    });

    const {
        setPageInfo,
        invoicesSearchRequest,
        setPaginatedInvoices,
        invoiceManageViewMode,
        setGlobalSpinState
    } = props;

    const getSortColumn = column => {
        if (column == "schedulerStatus") {
            return "SchedulerStatus.Name";
        }

        if (column == "createAt") {
            return "CreateAt";
        }
    };

    const getManageInvoices = useCallback(async () => {
        try {
            setIsInvoicesLoading(true);

            const invoices = await InvoiceJournalService.searchManageInvoiceByRequest(invoicesSearchRequest);
            setPaginatedInvoices(invoices.data.data);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.LOAD_INVOICE_ERROR);
            notification['error']({
                message: errorMessage
            });
        }

        setIsInvoicesLoading(false);
    }, [invoicesSearchRequest, setPaginatedInvoices]);

    useEffect(() => {
        setPageInfo(strings.PAGES.INVOICE_JOURNAL, null);
    }, [setPageInfo]);

    useEffect(() => {
        getManageInvoices();
    }, [getManageInvoices, invoicesSearchRequest]);

    const getSortOrderPerColumn = (columnName) => {
        return props.invoicesSearchRequest.sortCriteria === columnName
            ? props.invoicesSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    };

    const handleTableChange = (pagination, _filters, sorter) => {
        props.setInvoiceSearchParameters(
            pagination.pageSize,
            pagination.current,
            sorter?.order ? getSortColumn(sorter?.field) : undefined,
            sorter?.order ? sorter.order === "ascend" : undefined);
    };

    const previewInvoice = async (id) => {
        try {
            setGlobalSpinState(true);
            const fileResponse = await InvoiceJournalService.downloadInvoice(id);
            setPreviewState({
                ...previewState,
                previewExpanded: true,
                previewFile: fileResponse.data.data.fileBytes
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_DOWNLOAD_INVOICE);
            notification['error']({
                message: errorMessage
            });
        }
        setGlobalSpinState(false);
    };

    const downloadInvoice = async (id) => {
        try {
            setGlobalSpinState(true);
            const fileResponse = await InvoiceJournalService.downloadInvoice(id);
            downloadFileFromFileResponse("application/pdf", fileResponse);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_DOWNLOAD_INVOICE);
            notification['error']({
                message: errorMessage
            });
        }
        setGlobalSpinState(false);
    };

    const postponeInvoice = async (id) => {
        try {
            await InvoiceJournalService.updateInvoiceSchedulerStatus({
                invoiceId: id,
                status: invoiceManageStatuses.Postponed
            })
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_POSTPONE_INVOICE);
            notification['error']({
                message: errorMessage
            });
        }

        await getManageInvoices();
    };

    const scheduleInvoice = async (id) => {
        try {
            await InvoiceJournalService.updateInvoiceSchedulerStatus({
                invoiceId: id,
                status: invoiceManageStatuses.Planned
            })
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_SCHEDULE_INVOICE);
            notification['error']({
                message: errorMessage
            });
        }

        await getManageInvoices();
    };

    const clearFilteringOptions = () => {
        props.setInitialInvoiceSearchRequest();
    };

    const handleTabChange = async (value) => {
        props.setInvoiceManageViewMode(value);
    };

    const onDateRangeFilterChanged = (dates) => {
        props.setInvoicesSearchRequestDateRange(dates);
    };

    const generateClientsColumnPopup = clients => {
        return (
            <List
                itemLayout="horizontal"
                dataSource={clients}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.company}
                            description={item.companyId}
                        />
                    </List.Item>
                )}
            />
        );
    };

    const generateProjectsColumnPopup = projects => {
        return (
            <List
                itemLayout="horizontal"
                dataSource={projects}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.name}
                            description={item.number}
                        />
                    </List.Item>
                )}
            />
        );
    };

    const columns = [
        {
            title: 'Created At',
            dataIndex: 'createAt',
            key: 'createAt',
            width: '12%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('CreateAt'),
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FieldTimeOutlined />
                    <p className="col-text">
                        {row.createAt.toUTCKind().convertToEST(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT)}
                    </p>
                </div>,
            filterDropdown: (_) => (
                <RangePicker
                    className="start-date-picker"
                    value={[props.invoicesSearchRequest.dateFrom?.toUTCKind().convertToEST(), props.invoicesSearchRequest.dateTo?.toUTCKind().convertToEST()]}
                    onChange={(dates, _) => onDateRangeFilterChanged(dates)}
                    format={'MM-DD-YYYY'}
                    showTime={false}
                    showNow={false}
                />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />
        },
        {
            title: 'Invoice status',
            dataIndex: 'schedulerStatus',
            key: 'status',
            width: '18%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('SchedulerStatus.Name'),
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FileDoneOutlined />
                    <p className="col-text">
                        {row.schedulerStatus}
                    </p>
                </div>
        },
        {
            title: 'Business Parties',
            dataIndex: 'clients',
            key: 'clients',
            width: '30%',
            sorter: false,
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <UserOutlined />
                    <p className="col-text">
                        {row.clients.map(item => item.company).join(", ")}
                    </p>
                </div>
        },
        {
            title: 'Projects',
            dataIndex: 'projects',
            key: 'projects',
            width: '30%',
            sorter: false,
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FileOutlined />
                    <p className="col-text">
                        {row.projects.map(item => item.name).join(", ")}
                    </p>
                </div>
        },
        {
            key: 'action',
            width: '10%',
            render: (_, record) => {
                return (
                    <div className="table-actions">
                        {
                            invoiceManageViewMode == invoicePageViewModes.Queue ? (
                                <>
                                    <Button icon={<EyeOutlined />} onClick={() => previewInvoice(record.id)} />
                                    {
                                        record.schedulerStatusId == invoiceManageStatuses.Planned ? (
                                            <Popconfirm title="Are you sure want to postpone an invoice?" onConfirm={() => postponeInvoice(record.id)}>
                                                <Button icon={<RollbackOutlined />} />
                                            </Popconfirm>
                                        ) : (
                                            <Popconfirm title="Are you sure want to schedule an invoice?" onConfirm={() => scheduleInvoice(record.id)}>
                                                <Button icon={<RetweetOutlined />} />
                                            </Popconfirm>
                                        )
                                    }
                                </>
                            ) : (
                                <>
                                    <Button icon={<EyeOutlined />} onClick={() => previewInvoice(record.id)} />
                                    <Button icon={<DownloadOutlined />} onClick={() => downloadInvoice(record.id)} />
                                </>
                            )
                        }
                    </div>
                )
            },
        }
    ];

    return (
        <div className="invoice-journal-layout">
            {/* <div className="table-top">
                <div className="action-btn-group">
                    <Radio.Group className="view-mode-group" value={invoiceManageViewMode} onChange={e => handleTabChange(e.target.value)}>
                        <Radio.Button className="view-mode-label view-mode-left-label" value={invoicePageViewModes.Queue}>Queue</Radio.Button>
                        <Radio.Button className="view-mode-label view-mode-right-label" value={invoicePageViewModes.History}>History</Radio.Button>
                    </Radio.Group>
                    <CustomBtn className="cancel-btn" icon={<CloseCircleOutlined />} onClick={clearFilteringOptions} />
                </div>
            </div> */}
            <div className="client-list-layout">
                <Table
                    bordered
                    key="id"
                    rowKey="id"
                    rowClassName={'custom-table-row'}
                    showSorterTooltip={false}
                    dataSource={props.paginatedInvoices.data}
                    columns={columns}
                    loading={isInvoicesLoading}
                    onChange={handleTableChange}
                    expandedRowRender={(record) => <InvoicePreviewNested invoiceId={record.id} />}
                    expandIcon={({ expanded, onExpand, record }) =>
                        expanded ? (
                            <UpOutlined onClick={e => onExpand(record, e)} />
                        ) : (
                            <DownOutlined onClick={e => onExpand(record, e)} />
                        )}
                    pagination={{
                        current: props.invoicesSearchRequest.pageNumber,
                        pageSize: props.invoicesSearchRequest.pageSize,
                        total: props.paginatedInvoices.recordsCount,
                        pageSizeOptions: [10, 15, 100, 150, 200],
                        showSizeChanger: true
                    }}
                />
                <BackTop />
            </div>
            <Modal
                title="Report Preview"
                visible={previewState.previewExpanded}
                onOk={() => { }}
                onCancel={() => setPreviewState({
                    ...previewState,
                    previewExpanded: false
                })}
                width={1000}
                destroyOnClose={true}
                className="pdf-preview-modal"
                footer={false}
            >
                <div className="all-page-container">
                    <Document
                        file={`data:application/pdf;base64,${previewState.previewFile}`}
                        onLoadSuccess={({ numPages }) => setPreviewState({
                            ...previewState,
                            numPages: numPages
                        })}
                    >
                        {Array.from(new Array(previewState.numPages), (el, index) => (
                            <Page scale={1.5} key={`page_${index + 1}`} pageNumber={index + 1} />
                        ))}
                    </Document>
                </div>
            </Modal>
        </div>
    )
}

const mapState = ({ invoiceJournal }) => {
    return {
        paginatedInvoices: invoiceJournal.paginatedInvoices,
        invoicesSearchRequest: invoiceJournal.invoicesSearchRequest,
        invoiceManageViewMode: invoiceJournal.invoiceManageViewMode
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setPaginatedInvoices(value) {
            dispatch(actions.setPaginatedInvoices(value));
        },
        setInvoiceSearchRequestCriteria(value) {
            dispatch(actions.setInvoiceSearchRequestCriteria(value));
        },
        setInitialInvoiceSearchRequest() {
            dispatch(actions.setInitialInvoiceSearchRequest());
        },
        setInvoiceSearchParameters(pageSize, currentPage, property, isAscend) {
            dispatch(actions.setInvoiceSearchParameters({
                isAscend: isAscend,
                sortCriteria: property,
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        setInvoicesSearchRequestDateRange(value) {
            dispatch(actions.setInvoicesSearchRequestDateRange(value));
        },
        setInvoiceManageViewMode(value) {
            dispatch(actions.setInvoiceManageViewMode(value));
        }
    }
}

export default connect(mapState, mapDispatch)(InvoiceJournalPage);