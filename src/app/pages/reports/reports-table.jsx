import React, { useEffect, useRef, useCallback } from 'react';
import { useParams } from "react-router";
import { actions, INITIAL_REPORTS_SEARCH_REQUEST } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { ProjectsService, ReportsService, TrackingService } from '../../services';
import { Popconfirm, Table, Switch, notification, Tooltip } from 'antd';
import {
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    DownloadOutlined,
    UpOutlined,
    DownOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import history from '../../history';
import routes from '../routes';
import { strings, reportTypesIds, pageNumbers } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import { useDebouncedCallback } from 'use-debounce';
import { CustomBtn, SearchInput } from '../../components/common';
import { useReactToPrint } from 'react-to-print';
import TextCrop from '../../components/common/text-crop';
import ContactsNested from './contacts.component';
import { handleInjectedScripts } from '../../helpers/project-report-data-helper';

const ReportsTable = (props) => {
    const {
        setReportsSearchRequestProject,
        setDefaultPageState,
        setLoadingState,
        setPaginatedReports,
        reportsSearchRequest,
        setPageInfo,
        setProjectContacts
    } = props;

    const reportRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        onBeforePrint: () => props.setGlobalSpinState(false),
        onAfterPrint: () => document.getElementById("pdf-doc-elem").innerHTML = ''
    });

    const searchInputRef = useRef('');
    const { projectId } = useParams();

    useEffect(() => {
        if (reportsSearchRequest.projectId != INITIAL_REPORTS_SEARCH_REQUEST.projectId) {
            setLoadingState(true);
            loadReports().then(() => {
                setLoadingState(false);
            })
        }
    }, [loadReports, reportsSearchRequest, setLoadingState]);

    useEffect(() => {
        setLoadingState(true);
        loadProjectData(projectId).then(() => {
            setReportsSearchRequestProject(projectId);
            setLoadingState(false);
        });

        return () => {
            setDefaultPageState();
        };
    }, [loadProjectData, projectId, setDefaultPageState, setLoadingState, setReportsSearchRequestProject]);

    const loadReports = useCallback(async () => {
        try {
            const reportsResponse = await ReportsService.getReportsBySearchRequest(reportsSearchRequest);
            setPaginatedReports(reportsResponse.data.data);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_REPORTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [reportsSearchRequest, setPaginatedReports]);

    const loadProjectData = useCallback(async (id) => {
        try {
            const projectResponse = await ProjectsService.getProjectById(id);
            setPageInfo(projectResponse.data.data.name, pageNumbers.REPORTS_TABLE);
            setProjectContacts(projectResponse.data.data.contacts);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [setPageInfo, setProjectContacts]);

    const handleReportView = (dispatchRequestWorkOrderId, reportTypeId) => {
        if (reportTypeId == reportTypesIds.GENERIC_FIXTURE) {
            notification['error']({
                message: strings.COMMON.FIXTURE_REPORT_NOTIFICATION
            });
        } else {
            history.push({
                pathname: routes.GET_REPORT_ITEM_ROUTE(dispatchRequestWorkOrderId, reportTypeId)
            })
        }
    };

    const approveReport = async (dispatchRequestWorkOrderId) => {
        try {
            setLoadingState(true);
            await ReportsService.approveReport({ dispatchRequestWorkOrderId: dispatchRequestWorkOrderId });
            await loadReports();
            setLoadingState(false);
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
    };

    const renderSwitchCell = (checked, confirmText, dispatchRequestWorkOrderId) => {
        return (
            checked ? (
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={checked}
                    disabled={checked}
                />
            ) : (
                <Popconfirm placement="top" title={confirmText} onConfirm={() => approveReport(dispatchRequestWorkOrderId)} okText={strings.COMMON.OK} cancelText={strings.COMMON.CANCEL}>
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={checked}
                        disabled={checked}
                    />
                </Popconfirm>
            )
        );
    };

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setReportsSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const clearSortAndFilters = () => {
        props.setInitialReportsSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setReportsSearchRequestCriteria(searchString);
    }, 400);


    const setSorterPerColumn = (columnName) => {
        props.setReportsSearchRequestSorter(columnName, !props.reportsSearchRequest.isAscend);
    }

    const getSortOrderPerColumn = (columnName) => {
        return props.reportsSearchRequest.sortCriteria === columnName
            ? props.reportsSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    };

    const handleReportDownload = async (dispatchRequestWorkOrderId, reportTypeId) => {
        try {
            props.setGlobalSpinState(true);
            const downloadResponse = await ReportsService.downloadReport(dispatchRequestWorkOrderId);
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
        props.setGlobalSpinState(false);
    };

    const deleteReport = async (reportId) => {
        props.setGlobalSpinState(true);
        try {
            await ReportsService.deleteReport(reportId);

            notification['success']({
                message: strings.COMMON.REPORT_DELETED
            });

            await loadReports();
            props.setGlobalSpinState(false);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.DELETE_REPORT_ERROR);
            notification['error']({
                message: errorMessage,
            });

            props.setGlobalSpinState(false);
        }
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'dispatchRequestWorkOrder.workOrderId',
            key: 'dispatchRequestWorkOrder.workOrderId',
            sorter: true,
            width: "10%",
            sortOrder: getSortOrderPerColumn('dispatchRequestWorkOrder.workOrderId'),
            render: (_, row) => row.dispatchRequestWorkOrder.workOrderId
        },
        {
            title: 'Name',
            dataIndex: 'dispatchRequestWorkOrder.workOrder',
            key: 'dispatchRequestWorkOrder.workOrder',
            sorter: true,
            width: "50%",
            sortOrder: getSortOrderPerColumn('dispatchRequestWorkOrder.workOrder'),
            render: (_, row) => <TextCrop icon={false} inputString={row.dispatchRequestWorkOrder.workOrder} title="Title" />
        },
        {
            title: 'Business Party',
            dataIndex: 'dispatchRequestWorkOrder.dispatchRequest.client.company',
            key: 'dispatchRequestWorkOrder.dispatchRequest.client.company',
            sorter: true,
            width: "15%",
            sortOrder: getSortOrderPerColumn('dispatchRequestWorkOrder.dispatchRequest.client.company'),
            render: (_, row) => <TextCrop icon={false} inputString={row.dispatchRequestWorkOrder.client} title="Business Party" />
        },
        {
            title: 'Technician',
            dataIndex: 'technician',
            key: 'technician',
            sorter: true,
            width: "15%",
            sortOrder: getSortOrderPerColumn('technician'),
            render: (_, row) => <TextCrop icon={false} inputString={row.technician} title="Technician" />
        },
        {
            title: 'Approved',
            dataIndex: 'isApproved',
            key: 'isApproved',
            width: '3%',
            render: (cell, row) => renderSwitchCell(cell, strings.COMMON.REPORT_APPROVE, row.dispatchRequestWorkOrderId)
        },
        {
            dataIndex: 'actions',
            key: 'actions',
            width: '7%',
            render: (_, row) => {
                return (
                    <div className="report-btn">
                        <Tooltip title={strings.COMMON.VIEW_REPORT} placement="topRight">
                            <EyeOutlined onClick={() => handleReportView(row.dispatchRequestWorkOrderId, row.reportTypeId)} />
                        </Tooltip>
                        <Tooltip title={strings.COMMON.DOWNLOAD_REPORT} placement="topRight">
                            <DownloadOutlined onClick={() => handleReportDownload(row.dispatchRequestWorkOrderId, row.reportTypeId)} />
                        </Tooltip>
                        <Popconfirm title={strings.COMMON.DELETE_REPORT} onConfirm={() => deleteReport(row.id)}>
                            <DeleteOutlined />
                        </Popconfirm>
                    </div>
                )
            }
        }
    ];

    const isEmpty = !props.paginatedReports.data.length && !props.reportsSearchRequest.searchCriteria.length;

    return (
        <>
            <div className="table-top" style={{ height: '40px', justifyContent: isEmpty && 'flex-end' }}>
                {!isEmpty && (
                    <div className="action-btn-group">
                        <h2>{strings.COMMON.SORT_BY}</h2>
                        <CustomBtn name="Order ID" onClick={() => setSorterPerColumn('dispatchRequestWorkOrder.workOrderId')} type="search"></CustomBtn>
                        <CustomBtn name="Order Name" onClick={() => setSorterPerColumn('dispatchRequestWorkOrder.workOrder')} type="search"></CustomBtn>
                        <CustomBtn name="Business Party" onClick={() => setSorterPerColumn('dispatchRequestWorkOrder.dispatchRequest.client.company')} type="search"></CustomBtn>
                        <CustomBtn name="Technician" onClick={() => setSorterPerColumn('technician')} type="search"></CustomBtn>
                        <SearchInput defaultValue={props.reportsSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                        <CustomBtn className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />}></CustomBtn>
                    </div>
                )}
                <div className="unapproved-switcher">
                    <p>{strings.COMMON.ONLY_UNAPPROVED}</p>
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        disabled={props.loading}
                        checked={!props.reportsSearchRequest.isApproved}
                        onChange={(value) => props.setReportsSearchRequestApproved(!value)}
                    />
                </div>
            </div>
            <div className="reports-table-layout">
                <Table
                    key="id"
                    dataSource={props.paginatedReports.data}
                    columns={columns}
                    loading={props.loading}
                    bordered
                    rowClassName="custom-table-row"
                    rowKey="id"
                    showSorterTooltip={false}
                    onChange={handleTableChange}
                    expandedRowRender={props.reportsSearchRequest.isApproved && ((record) => {
                        return (
                            <ContactsNested
                                loadReports={loadReports}
                                setLoadingState={setLoadingState}
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
                        current: props.reportsSearchRequest.pageNumber,
                        pageSize: props.reportsSearchRequest.pageSize,
                        total: props.paginatedReports.recordsCount,
                        pageSizeOptions: [10, 15, 100, 150, 200],
                        showSizeChanger: true
                    }}
                />
            </div>
            <div style={{ position: "absolute", left: "-3999px" }}>
                <div id="pdf-doc-elem" ref={reportRef}></div>
            </div>
        </>
    )
}

const mapState = ({ reports }) => {
    return {
        loading: reports.loading,
        projectId: reports.projectId,
        reports: reports.reports,
        reportsSearchRequest: reports.reportsSearchRequest,
        paginatedReports: reports.paginatedReports
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setLoadingState(value) {
            dispatch(actions.setLoadingState(value));
        },
        setProjectId(value) {
            dispatch(actions.setProjectId(value));
        },
        setReports(values) {
            dispatch(actions.setReports(values));
        },
        setPaginatedReports(value) {
            dispatch(actions.setPaginatedReports(value));
        },
        setReportsSearchRequestCriteria(value) {
            dispatch(actions.setReportsSearchRequestCriteria(value));
        },
        setInitialReportsSearchRequest() {
            dispatch(actions.setInitialReportsSearchRequest());
        },
        setReportsSearchRequestSorter(property, isAscend) {
            dispatch(actions.setReportsSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setReportsSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setReportsSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        setReportsSearchRequestApproved(value) {
            dispatch(actions.setReportsSearchRequestApproved(value));
        },
        setReportsSearchRequestProject(value) {
            dispatch(actions.setReportsSearchRequestProject(value));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setProjectContacts(value) {
            dispatch(actions.setProjectContacts(value));
        },
        setDefaultPageState() {
            dispatch(actions.setDefaultPageState());
        },
        setNotificationReportRevision(value) {
            dispatch(actions.setNotificationReportRevision(value));
        }
    }
}

export default connect(mapState, mapDispatch)(ReportsTable);