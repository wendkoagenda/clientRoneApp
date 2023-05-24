import React, { useEffect, useState, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { CustomBtn, SearchInput } from '../../components/common/';
import TextCrop from '../../components/common/text-crop';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './work-orders-reducer';
import { actions as dispatchActions } from './dispatch-reducer';
import { actionTypesDispatchProcess, pageNumbers, strings } from '../../constants';
import history from '../../history';
import { HubConnectionBuilder } from '@microsoft/signalr';
import getConfig from "../../../app/config";
import { Button, Table, notification, Typography, Popconfirm, BackTop, Tooltip, Checkbox, DatePicker, Switch } from 'antd';
import {
    UserOutlined,
    FileOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    EditOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    MailOutlined,
    InfoCircleOutlined,
    UnorderedListOutlined,
    FieldTimeOutlined,
    FileDoneOutlined,
    FilterOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { DispatchService } from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import routes from '../routes';
import { useDebouncedCallback } from 'use-debounce';
import workOrderStatusColors from '../../constants/workOrderStatusColors';
import { downloadFileFromFileResponse } from '../../helpers/file-download-helper';
import { disabledMinutes } from '../../helpers/date-time-helper';
import { workOrderUIStatuses } from '../../constants/order-statuses';
import { makeCancelable } from '../../helpers/function-extensions';
const { RangePicker } = DatePicker;

const { Title } = Typography;

const WorkOrdersListPage = (props) => {
    const { workOrdersSearchRequest, setPaginatedWorkOrders } = props;
    const [isWorkOrdersLoading, setIsWorkOrdersLoading] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const searchInputRef = useRef('');

    const loadWorkOrders = useCallback(async () => {
        setIsWorkOrdersLoading(true);

        try {
            const dispatchResponse = await DispatchService.searchWorkOrderByRequest(workOrdersSearchRequest);
            setPaginatedWorkOrders(dispatchResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_DISPATCHES_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsWorkOrdersLoading(false);
    }, [setPaginatedWorkOrders, workOrdersSearchRequest]);

    const clearSortAndFilters = () => {
        props.setInitialWorkOrdersSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setWorkOrdersSearchRequestCriteria(searchString);
    }, 400);

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setWorkOrdersSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.workOrdersSearchRequest.sortCriteria === columnName
            ? props.workOrdersSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    };

    const setSorterPerColumn = (columnName) => {
        props.setWorkOrdersSearchRequestSorter(columnName, !props.workOrdersSearchRequest.isAscend);
    };

    const editDispatch = async (dispatchRequestId) => {
        try {
            const dispatchResponse = await DispatchService.getById(dispatchRequestId);

            props.clearEditingDispatch();
            props.setEditingDispatchModel(dispatchResponse.data.data);
            history.push(routes.DISPATCH_MANAGEMENT);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_DISPATCHES_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const unassignWorkOrder = async (record) => {
        if (record.technicianId == 0) {
            notification['error']({
                message: strings.COMMON.WORK_ORDER_IS_UNASSIGNED
            });
        } else {
            try {
                await DispatchService.cancelWorkOrder({
                    dispatchRequestId: record.dispatchRequestId,
                    technicianId: record.technicianId,
                    startAt: record.startAt,
                    endAt: record.endAt,
                    workOrderId: record.workOrderId,
                    actionType: actionTypesDispatchProcess.CANCEL
                });

                notification['success']({
                    message: strings.COMMON.WORK_ORDER_IS_UNASSIGNED
                });

                await loadWorkOrders();
            } catch (error) {
                TrackingService.trackException(error);
                const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_DISPATCHES_ERROR);
                notification['error']({
                    message: errorMessage
                });
            }
        }
    };

    const sendNotification = async (record) => {
        if (record.technicianId == 0) {
            notification['error']({
                message: strings.COMMON.WORK_ORDER_IS_UNASSIGNED
            });
        } else {
            try {
                await DispatchService.sendNotification({
                    dispatchRequestId: record.dispatchRequestId,
                    workOrderId: record.workOrderId
                });

                notification['success']({
                    message: strings.COMMON.NOTIFICATION_SENT
                });

                await loadWorkOrders();
            } catch (error) {
                TrackingService.trackException(error);
                const errorMessage = getErrorMessage(error, strings.COMMON.NOTIFICATION_SENDING_ERROR);
                notification['error']({
                    message: errorMessage
                });
            }
        }
    };

    const addDispatch = () => {
        props.clearEditingDispatch();
        history.push(routes.DISPATCH_MANAGEMENT);
    };

    const exportWorkOrders = async () => {
        try {
            const fileResponse = await DispatchService.exportWorkOrders();

            downloadFileFromFileResponse("text/csv", fileResponse);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.DISPATCH.ERROR_NOTIFICATIONS.UNABLE_TO_EXPORT_WORK_ORDERS);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const renderWorkOrderStatusCell = (_, row) => {
        let statusParameters = { text: "Created", color: workOrderStatusColors.Created };

        if (row.uiStatusId == workOrderUIStatuses.Assigned) {
            statusParameters = { text: "Assigned", color: workOrderStatusColors.Assigned };
        }

        if (row.uiStatusId == workOrderUIStatuses.Notified) {
            statusParameters = { text: "Notified", color: workOrderStatusColors.Notified };
        }

        if (row.uiStatusId == workOrderUIStatuses.Confirmed) {
            statusParameters = { text: "Confirmed", color: workOrderStatusColors.Confirmed };
        }

        if (row.uiStatusId == workOrderUIStatuses.ReportSubmitted) {
            statusParameters = { text: "Report Submitted", color: workOrderStatusColors.ReportSubmitted };
        }
        return (
            <Tooltip placement="top" title={statusParameters.text}>
                <div className="dispatch-info-col work-order-status-column" style={{ backgroundColor: statusParameters.color }}>
                    <InfoCircleOutlined style={{ color: "#404040" }} className="work-order-status-label" />
                </div>
            </Tooltip>
        );
    };

    const renderWorkOrderIdColumn = (_, row) => {
        const maxIdLength = 8;
        const prefix = "0".repeat(maxIdLength - `${row.workOrderId}`.length);

        return (
            <div className="dispatch-info-col">
                {!row.parentWorkOrderId && (
                    <p className="col-text">{`${prefix}${row.workOrderId}`}</p>
                )}
            </div>
        );
    };

    useEffect(() => {
        loadWorkOrders();
    }, [loadWorkOrders, props.workOrdersSearchRequest]);

    useEffect(() => {
        const setupAssignOrderConnection = () => {
            const connection = new HubConnectionBuilder()
                .withUrl(`${getConfig().apiBaseUrl}/hubs/assign-order`)
                .withAutomaticReconnect()
                .build();

            connection.on('ReceiveWorkOrder', assignedOrderModel => {
                switch (assignedOrderModel.actionType) {
                    case actionTypesDispatchProcess.ASSIGN:
                        props.assignOrUpdateWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.startAt,
                            assignedOrderModel.endAt,
                            assignedOrderModel.statusId,
                            assignedOrderModel.technicianId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    case actionTypesDispatchProcess.UPDATE:
                        props.assignOrUpdateWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.startAt,
                            assignedOrderModel.endAt,
                            assignedOrderModel.statusId,
                            assignedOrderModel.technicianId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    case actionTypesDispatchProcess.CANCEL:
                        props.unassignWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.statusId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    case actionTypesDispatchProcess.CONFIRMED:
                        props.confirmWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    case actionTypesDispatchProcess.NOTIFIED:
                        props.sendWorkOrderNotification(
                            assignedOrderModel.id,
                            assignedOrderModel.statusId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    case actionTypesDispatchProcess.COMPLETED:
                        props.completeWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.statusId,
                            assignedOrderModel.uiStatusId
                        );
                        break;

                    default:
                        props.unassignWorkOrder(
                            assignedOrderModel.workOrderId,
                            assignedOrderModel.dispatchRequestId,
                            assignedOrderModel.statusId,
                            assignedOrderModel.uiStatusId
                        );
                        break;
                }
            });

            return connection;
        };

        props.setPageInfo(strings.PAGES.WORK_ORDERS_LIST, pageNumbers.DISPATCH);

        const workOrderAssignConnection = setupAssignOrderConnection();
        const hubConnectionPromise = makeCancelable(workOrderAssignConnection.start());
        return () => {
            (async () => {
                hubConnectionPromise.cancel();
                await workOrderAssignConnection.stop();
            })();
        }
    }, []);

    const onDateRangeFilterChanged = (dates) => {
        props.setWorkOrderSearchRequestDateRange(dates);
    };

    const handleFilterChange = useDebouncedCallback((value) => {
        props.setWorkOrderSearchRequestStatusIds(value)
        setCheckAll(value.length === Object.keys(workOrderUIStatuses).length);
    }, 200);

    const handleFilterSelectAllChange = e => {
        e.target.checked
            ? props.setWorkOrderSearchRequestStatusIds(Object.values(workOrderUIStatuses))
            : props.setWorkOrderSearchRequestStatusIds([])
        setCheckAll(e.target.checked);
    }

    const columns = [
        {
            title: 'Number',
            dataIndex: 'workOrderId',
            key: 'workOrderId',
            width: '8%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('workOrderId'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: renderWorkOrderIdColumn
        },
        {
            title: 'Report Type',
            dataIndex: 'title',
            key: 'title',
            width: '28%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('workOrder.title'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FileDoneOutlined /><p className="col-text">{row.workOrder.title}</p>
                </div>
        },
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            width: '28%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('dispatchRequest.project.name'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FileOutlined /><p className="col-text">{row.project.name}</p>
                </div>
        },
        {
            title: 'Start Time',
            dateIndex: 'startTime',
            key: 'startTime',
            width: '10%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('estimatedStartDate'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <FieldTimeOutlined />
                    <p className="col-text">
                        {row.workOrder.startDate.toUTCKind().convertToEST(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT_WITH_TIME)}
                    </p>
                </div>,
            filterDropdown: (_) => (
                <RangePicker
                    className="start-date-picker"
                    value={[props.workOrdersSearchRequest.estimatedStartDateFrom?.toUTCKind().convertToEST(), props.workOrdersSearchRequest.estimatedStartDateTo?.toUTCKind().convertToEST()]}
                    onChange={(dates, _) => onDateRangeFilterChanged(dates)}
                    format={'MM-DD-YYYY HH:mm'}
                    disabledMinutes={disabledMinutes}
                    showTime={true}
                    showNow={false}
                    hideDisabledOptions
                />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />
        },
        {
            title: 'Technician',
            dataIndex: 'technician',
            key: 'technician',
            width: '14%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('technician.fullName'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: (_, row) =>
                <div className="dispatch-info-col">
                    <UserOutlined />
                    {
                        !!row.technicianId && <p className="col-text">{row.technician}</p>
                    }
                </div>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '5%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('statusId'),
            filterDropdown: (_) => (
                <div className="checkbox-dropdown">
                    <Checkbox
                        onChange={handleFilterSelectAllChange}
                        checked={checkAll}>
                        {'Select All'}
                    </Checkbox>
                    <Checkbox.Group
                        value={props.workOrdersSearchRequest.workOrderStatusIds}
                        style={{
                            marginLeft: '10%',
                            width: '100%',
                            display: 'flex'
                        }}
                        onChange={handleFilterChange}>
                        {
                            Object.keys(workOrderUIStatuses).map(
                                status =>
                                    <Checkbox
                                        key={workOrderUIStatuses[status]}
                                        value={workOrderUIStatuses[status]}>
                                        <span className="dispatch-info-col work-order-statuses"
                                            style={{ backgroundColor: workOrderStatusColors[status] }}>
                                        </span>
                                        {workOrderUIStatuses[status] === workOrderStatusColors.ReportSubmitted ? strings.COMMON.REPORT_SUBMITTED : status}
                                    </Checkbox>)
                        }
                    </Checkbox.Group>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />,
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.dispatchRequestId)
                }
            },
            render: renderWorkOrderStatusCell
        },
        {
            key: 'action',
            width: '7%',
            fixed: 'right',
            render: (_, record) => {
                return (
                    <div className="table-actions">
                        <Popconfirm title="Are you sure want to send notification?" onConfirm={() => sendNotification(record)}>
                            <Button icon={<MailOutlined />} />
                        </Popconfirm>
                        <Popconfirm title="Are you sure to unassign current work order?" onConfirm={() => unassignWorkOrder(record)}>
                            <Button className="delete-btn" icon={<CloseOutlined />} />
                        </Popconfirm>
                    </div>
                )
            },
        }
    ];

    const isEmpty = (!props.paginatedWorkOrders.data || !props.paginatedWorkOrders.data.length) && !props.workOrdersSearchRequest.isFiltered;

    return (
        <>
            <div className="table-top">
                <div className="action-btn-group">
                    {!isEmpty &&
                        <>
                            <h2>{strings.COMMON.SORT_BY}</h2>
                            <CustomBtn name="Number" onClick={() => setSorterPerColumn('workOrderId')} type="search" />
                            <CustomBtn name="Report Type" onClick={() => setSorterPerColumn('workOrder.title')} type="search" />
                            <CustomBtn name="Project Name" onClick={() => setSorterPerColumn('dispatchRequest.project.name')} type="search" />
                            <CustomBtn name="Start Time" onClick={() => setSorterPerColumn('estimatedStartDate')} type="search" />
                            <CustomBtn name="Full Name" onClick={() => setSorterPerColumn('technician.fullName')} type="search" />
                            <CustomBtn name="Status" onClick={() => setSorterPerColumn('statusId')} type="search" />
                            <SearchInput defaultValue={props.workOrdersSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                            <CustomBtn className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />} />
                        </>
                    }
                </div>
                <div className="temporary-filters">
                    <Switch
                        checkedChildren={strings.DISPATCH.LABELS.TEMPORARY_CLIENT}
                        unCheckedChildren={strings.DISPATCH.LABELS.TEMPORARY_CLIENT}
                        checked={props.workOrdersSearchRequest.isTemporaryClient}
                        onClick={props.setTemporaryClientSearchRequest}
                    />
                    <Switch
                        checkedChildren={strings.DISPATCH.LABELS.TEMPORARY_SITE}
                        unCheckedChildren={strings.DISPATCH.LABELS.TEMPORARY_SITE}
                        checked={props.workOrdersSearchRequest.isTemporarySite}
                        onClick={props.setTemporarySiteSearchRequest}
                    />
                </div>
                <div className="add-client-btn work-orders-btn-action-group">
                    <CustomBtn name="Export" className="work-order-export-action-btn" icon={<ExportOutlined style={{ fontSize: '18px' }} />} onClick={exportWorkOrders} type="primary" />
                    <CustomBtn name="Dispatches" className="work-order-action-btn" icon={<UnorderedListOutlined style={{ fontSize: '18px' }} />} onClick={() => history.push(routes.DISPATCHES)} type="primary" />
                    <CustomBtn icon={<EnvironmentOutlined style={{ fontSize: '18px' }} />} onClick={addDispatch} type="primary" />
                </div>
            </div>
            <div className="dispatch-work-orders-layout" style={isEmpty ? { height: '87%' } : {}}>
                {isEmpty
                    ? <div className="add-client">
                        <Title level={4}>{strings.COMMON.EMPTY_DISPATCHES}</Title>
                        <CustomBtn icon={<EnvironmentOutlined />} type="Default" onClick={addDispatch} name={strings.PAGES.DISPATCH_MANAGEMENT.ADD} />
                    </div>
                    : <div className="dispatch-table">
                        <Table
                            bordered
                            key="id"
                            rowKey="id"
                            rowClassName={'custom-table-row'}
                            showSorterTooltip={false}
                            dataSource={props.paginatedWorkOrders.data}
                            columns={columns}
                            scroll={{ x: true }}
                            loading={isWorkOrdersLoading}
                            onChange={handleTableChange}
                            pagination={{
                                current: props.workOrdersSearchRequest.pageNumber,
                                pageSize: props.workOrdersSearchRequest.pageSize,
                                total: props.paginatedWorkOrders.recordsCount,
                                pageSizeOptions: [10, 15, 100, 150, 200],
                                showSizeChanger: true
                            }}
                        />
                    </div>
                }
            </div>
            <BackTop />
        </>
    )
}

const mapState = ({ workOrders }) => {
    return {
        workOrdersSearchRequest: workOrders.workOrdersSearchRequest,
        paginatedWorkOrders: workOrders.paginatedWorkOrders
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setPaginatedWorkOrders(value) {
            dispatch(actions.setPaginatedWorkOrders(value));
        },
        sendWorkOrderNotification(id, statusId, uiStatusId) {
            dispatch(actions.sendWorkOrderNotification({ id, statusId, uiStatusId }));
        },
        completeWorkOrder(workOrderId, dispatchRequestId, statusId, uiStatusId) {
            dispatch(actions.completeWorkOrder({ workOrderId, dispatchRequestId, statusId, uiStatusId }));
        },
        setTemporarySiteSearchRequest(value) {
            dispatch(actions.setTemporarySiteSearchRequest(value));
        },
        setTemporaryClientSearchRequest(value) {
            dispatch(actions.setTemporaryClientSearchRequest(value));
        },
        confirmWorkOrder(workOrderId, dispatchRequestId, uiStatusId) {
            dispatch(actions.confirmWorkOrder({ workOrderId, dispatchRequestId, uiStatusId }))
        },
        assignOrUpdateWorkOrder(workOrderId, dispatchRequestId, startAt, endAt, statusId, technicianId, uiStatusId) {
            dispatch(actions.assignOrUpdateWorkOrder({ workOrderId, dispatchRequestId, startAt, endAt, statusId, technicianId, uiStatusId }));
        },
        unassignWorkOrder(workOrderId, dispatchRequestId, statusId, uiStatusId) {
            dispatch(actions.unassignWorkOrder({ workOrderId, dispatchRequestId, statusId, uiStatusId }))
        },
        setWorkOrdersSearchRequestCriteria(value) {
            dispatch(actions.setWorkOrdersSearchRequestCriteria(value));
        },
        setInitialWorkOrdersSearchRequest() {
            dispatch(actions.setInitialWorkOrdersSearchRequest());
        },
        setWorkOrdersSearchRequestSorter(property, isAscend) {
            dispatch(actions.setWorkOrdersSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setWorkOrdersSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setWorkOrdersSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        clearEditingDispatch() {
            dispatch(dispatchActions.clearEditingDispatch());
        },
        setEditingDispatchModel(value) {
            dispatch(dispatchActions.setEditingDispatchModel(value));
        },
        setWorkOrderSearchRequestStatusIds(value) {
            dispatch(actions.setWorkOrderSearchRequestStatusIds(value));
        },
        setWorkOrderSearchRequestDateRange(value) {
            dispatch(actions.setWorkOrderSearchRequestDateRange(value));
        }
    }
}

export default connect(mapState, mapDispatch)(WorkOrdersListPage);