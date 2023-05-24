import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { CustomBtn, SearchInput } from '../../components/common/';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { notification, Table, DatePicker, Tooltip, Switch, Checkbox, BackTop } from 'antd';
import { useReactToPrint } from 'react-to-print';
import {
    SearchOutlined,
    CloseCircleOutlined,
    UpOutlined,
    DownOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { useDebouncedCallback } from 'use-debounce';
import { invoiceOrderStatusesWithNames, pageNumbers, reportTypesIds, strings } from '../../constants';
import { actions } from '../report-list/report-list.reducer';
import { CustomerPortalService } from '../../services';
import TextCrop from '../../components/common/text-crop';
import { DEFAULT_UTC_OFFSET } from '../../helpers/timeline-helper';
import moment from 'moment';
import routes from '../routes';
import history from '../../history';
import ContactsNested from '../../pages/reports/contacts.component'
import { handleInjectedScripts } from '../../helpers/project-report-data-helper';
import { AddZerosToReportNumber } from '../../helpers/add-zeros-to-numbers';
import { useParams } from 'react-router';

const { RangePicker } = DatePicker;

const reportListProps = [
    {
        name: 'Client',
        sorterName: 'DispatchRequestWorkOrder.DispatchRequest.Client.Company'
    },
    {
        name: 'Project',
        sorterName: 'DispatchRequestWorkOrder.DispatchRequest.Project.Name'
    },
    {
        name: 'WO',
        sorterName: 'DispatchRequestWorkOrder.WorkOrder.Title'
    },
    {
        name: 'WO Date',
        sorterName: 'CreateAt'
    },
    {
        name: 'Report Number',
        sorterName: 'Id'
    },
    {
        name: 'Status',
        sorterName: 'DispatchRequestWorkOrder.InvoiceStatusId'
    },
    {
        name: 'Section',
        sorterName: 'DispatchRequestWorkOrder.WorkOrder.Category'
    },
    {
        name: 'Manager',
        sorterName: 'Manager.FullName'
    }
]

const ReportList = (props) => {
    const [isReportListLoading, setReportListLoading] = useState(false);
    const searchInputRef = useRef('');
    const reportRef = useRef();
    const relatedProjectId = useParams()?.projectId;

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        onBeforePrint: () => props.setGlobalSpinState(false),
        onAfterPrint: () => document.getElementById("pdf-doc-elem").innerHTML = ''
    });

    const {
        setPaginatedReportList,
        reportListSearchRequest,
        paginatedReportList,
        setReportListSearchRequestPagination,
        setInitialReportListSearchRequest,
        setReportListSearchRequestCriteria,
        setReportListSearchRequestDateRange,
        setGlobalSpinState,
        setPageInfo,
        setReportListInvoiceStatusRequest,
        setReportsSearchRequestApproved,
    } = props;

    const loadReportList = useCallback(async () => {

        try {
            const reportListRepose = relatedProjectId 
                                        ? await CustomerPortalService.getReportListRelatedToProject(reportListSearchRequest, relatedProjectId)
                                        : await CustomerPortalService.getReportListByRequest(reportListSearchRequest)
            setPaginatedReportList(reportListRepose.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.REPORTS.REPORT_FETCH_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [reportListSearchRequest, setPaginatedReportList])

    useEffect(() => {
        setPageInfo(strings.PAGES.REPORT_LIST, pageNumbers.REPORT_LIST);
        setReportListLoading(true);
        loadReportList().then(() => {
            setReportListLoading(false);
        });
    }, [loadReportList, reportListSearchRequest, setPageInfo])

    const handleTableChange = (pagination, _filters, _sorter) => {
        setReportListSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const clearSortAndFilters = () => {
        setInitialReportListSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const setSearch = useDebouncedCallback((searchString) => {
        setReportListSearchRequestCriteria(searchString);
    }, 400);

    const setSorterPerColumn = (columnName) => {
        props.setReportListSearchRequestSorter(columnName, !reportListSearchRequest.isAscend);
    }

    const viewReport = (record) => {
        if (record.reportTypeId == reportTypesIds.GENERIC_FIXTURE) {
            notification['error']({
                message: strings.COMMON.FIXTURE_REPORT_NOTIFICATION
            });
        } else {
            history.push({
                pathname: routes.GET_CUSTOMER_REPORT_ITEM_ROUTE(record.dispatchRequestWorkOrderId, record.reportTypeId)
            })
        }
    }

    const handleReportDownload = async (dispatchRequestWorkOrderId, reportTypeId) => {
        try {
            setGlobalSpinState(true);
            const downloadResponse = await CustomerPortalService.downloadReport(dispatchRequestWorkOrderId);
            document.getElementById("pdf-doc-elem").innerHTML = downloadResponse.data;
            handleInjectedScripts(reportTypeId);
            handlePrint();
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_DOWNLOAD_REPORT);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    };

    const renderActionsColumn = (cell, row) => {
        return (
            <div className="report-buttons">
                <EyeOutlined onClick={() => viewReport(row)} />
                <Tooltip title={strings.COMMON.DOWNLOAD_REPORT} placement="topRight">
                    <DownloadOutlined onClick={() => handleReportDownload(row.dispatchRequestWorkOrderId, row.reportTypeId)} />
                </Tooltip>
            </div>
        )
    };

    const columns = [
        {
            title: 'Client',
            dataIndex: ['dispatchRequestWorkOrder', 'client'],
            key: 'client',
            render: text => <TextCrop icon={false} inputString={text} title="Client" />
        },
        {
            title: 'Project',
            dataIndex: ['dispatchRequestWorkOrder', 'project'],
            key: 'project',
            render: text => <TextCrop icon={false} inputString={text} title="Project" />
        },
        {
            title: 'Work Order',
            dataIndex: ['dispatchRequestWorkOrder', 'workOrderTitle'],
            key: 'workOrderTitle',
            render: text => <TextCrop icon={false} inputString={text} title="Work Order" />
        },
        {
            title: 'WO Date',
            dataIndex: 'createAt',
            key: 'createAt',
            filterDropdown: (_) => (
                <RangePicker
                    className="start-date-picker"
                    value={[reportListSearchRequest.createdAtFrom?.toUTCKind().convertToEST(), reportListSearchRequest.createdAtTo?.toUTCKind().convertToEST()]}
                    onChange={(values) => setReportListSearchRequestDateRange(values)}
                    showTime={false}
                    showNow={false}
                />
            ),
            render: text => <TextCrop icon={false} inputString={moment(text).utcOffset(DEFAULT_UTC_OFFSET).format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT)} title="WO Date" />
        },
        {
            title: 'Report Number',
            dataIndex: 'id',
            key: 'id',
            render: text => <TextCrop icon={false} inputString={AddZerosToReportNumber(text)} title="Report Number" />
        },
        {
            title: 'Status',
            dataIndex: ['dispatchRequestWorkOrder', 'invoiceStatusId'],
            key: 'invoiceStatusId',
            filterDropdown: (_) => (
                <div className="checkbox-dropdown">
                    <Checkbox.Group style={{ width: '100%' }} value={reportListSearchRequest.invoiceStatusIds} onChange={(values) => setReportListInvoiceStatusRequest(values)}>
                        {invoiceOrderStatusesWithNames.map(item => (
                            <Checkbox key={item.id} style={{ marginLeft: '10%', width: '100%' }} value={item.id}>{item.name}</Checkbox>
                        ))}
                    </Checkbox.Group>
                </div>
            ),
            render: text => <TextCrop icon={false} inputString={invoiceOrderStatusesWithNames.find(item => item.id == text).name} title="Status" />,
        },
        {
            title: 'Section',
            dataIndex: ['dispatchRequestWorkOrder', 'workOrderSection'],
            key: 'workOrderSection',
            render: text => <TextCrop icon={false} inputString={text} title="Section" />,
        },
        {
            title: 'Report Name',
            dataIndex: ['dispatchRequestWorkOrder', 'reportExportName'],
            key: 'reportExportName',
            render: text => <TextCrop icon={false} inputString={text} title="Section" />
        },
        {
            title: 'Project Manager',
            dataIndex: 'managerFullName',
            key: 'managerFullName',
            render: text => <TextCrop icon={false} inputString={text} title="Project Manager" />
        },
        {
            title: 'Approved',
            dataIndex: 'isApproved',
            key: 'isApproved',
            width: 120,
            fixed: 'right',
            render: (cell) => <TextCrop icon={false} inputString={cell ? strings.COMMON.YES : strings.COMMON.NO} title={strings.COMMON.REPORT_APPROVE} />
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            fixed: 'right',
            width: 100,
            render: renderActionsColumn
        }
    ]

    const isEmpty = (!paginatedReportList.data || !paginatedReportList.data.length) && !paginatedReportList.isFiltered;

    return (
        <>
            <div className="table-top" style={{ alignItems: 'flex-start' }}>
                <div className="action-btn-group report-list-header" style={{ alignItems: 'flex-start' }}>
                    {
                        reportListProps.map((item, index) => (
                            <CustomBtn key={index} name={item.name} onClick={() => setSorterPerColumn(item.sorterName)} type="search" />
                        ))
                    }
                    <SearchInput defaultValue={reportListSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                    <CustomBtn style={{ marginTop: '7px' }} className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />} />
                </div>
                <div className="unapproved-switcher">
                    {relatedProjectId &&
                        <CustomBtn type="primary"
                            name={strings.COMMON.VIEW_ALL}
                            className="view-all-btn"
                            onClick={_ => {history.push(routes.REPORT_LIST_BY_CUSTOMER); window.location.reload();}}
                        />
                    }
                    <p>{strings.COMMON.ONLY_UNAPPROVED}</p>
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        disabled={isReportListLoading}
                        checked={!reportListSearchRequest.isApproved}
                        onChange={setReportsSearchRequestApproved}
                    />
                </div>
            </div>
            <div className="client-list-layout" style={isEmpty ? { height: '87%' } : {}}>
                <div className="report-list">
                    <Table
                        bordered
                        key="id"
                        rowKey="id"
                        rowClassName={'custom-table-row'}
                        showSorterTooltip={false}
                        dataSource={paginatedReportList.data}
                        columns={columns}
                        loading={isReportListLoading}
                        onChange={handleTableChange}
                        scroll={{ x: '100vw' }}
                        sticky
                        expandedRowRender={reportListSearchRequest.isApproved && ((record) => {
                            return (
                                <ContactsNested
                                    loadReports={loadReportList}
                                    record={record} />
                            )
                        })}
                        expandIcon={({ expanded, onExpand, record }) =>
                            expanded ? (
                                <UpOutlined onClick={e => onExpand(record, e)} />
                            ) : (
                                <DownOutlined onClick={e => onExpand(record, e)} />
                            )}
                        pagination={{
                            current: reportListSearchRequest.pageNumber,
                            pageSize: reportListSearchRequest.pageSize,
                            total: paginatedReportList.recordsCount,
                            pageSizeOptions: [10, 15, 20],
                            showSizeChanger: true
                        }}
                    />
                </div>
            </div>
            <BackTop />
            <div style={{ position: "absolute", left: "-3999px" }}>
                <div id="pdf-doc-elem" ref={reportRef}></div>
            </div>
        </>
    )
}

const mapState = ({ reportList }) => {
    return {
        reportListSearchRequest: reportList.reportListSearchRequest,
        paginatedReportList: reportList.paginatedReportList
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
        setPaginatedReportList(value) {
            dispatch(actions.setPaginatedReportList(value));
        },
        setReportListSearchRequestCriteria(value) {
            dispatch(actions.setReportListSearchRequestCriteria(value));
        },
        setInitialReportListSearchRequest() {
            dispatch(actions.setInitialReportListSearchRequest());
        },
        setReportListSearchRequestSorter(property, isAscend) {
            dispatch(actions.setReportListSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setReportListSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setReportListSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        setReportsSearchRequestApproved(value) {
            dispatch(actions.setReportsSearchRequestApproved(value));
        },
        setReportListInvoiceStatusRequest(values) {
            dispatch(actions.setReportListInvoiceStatusRequest(values));
        },
        setReportListSearchRequestDateRange(value) {
            dispatch(actions.setReportListSearchRequestDateRange(value));
        }
    }
}

export default connect(mapState, mapDispatch)(ReportList);