import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './work-orders-management-reducer';
import { WorkOrdersManagementService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { strings } from '../../constants';
import { Table, notification, Popconfirm, BackTop, Switch } from 'antd';
import {
    SearchOutlined,
    CloseCircleOutlined,
    TagOutlined,
    FolderOutlined
} from '@ant-design/icons';
import { CustomBtn, SearchInput, TextCrop } from '../../components/common/';
import { useDebouncedCallback } from 'use-debounce';


const WorkOrdersList = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const searchInputRef = useRef('');

    const getWorkOrders = async () => {
        try {
            const response = await WorkOrdersManagementService.searchByRequest(props.workOrdersSearchRequest);
            props.setWorkOrders(response.data.data);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.WORK_ORDERS_MANAGEMENT.ERRORS.GET_WORK_ORDERS);

            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setWorkOrdersSearchRequestCriteria(searchString);
    }, 400);

    const clearSortAndFilters = () => {
        props.setInitialWorkOrdersSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setWorkOrdersSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const setSorterPerColumn = (columnName) => {
        props.setWorkOrdersSearchRequestSorter(columnName, !props.workOrdersSearchRequest.isAscend);
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.workOrdersSearchRequest.sortCriteria === columnName
            ? props.workOrdersSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    };

    const switchPickupState = async (id) => {
        try {
            await WorkOrdersManagementService.switchPickupStatus(id);

            await getWorkOrders();
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.WORK_ORDERS_MANAGEMENT.ERRORS.SWITCH_PICKUP_STATUS);

            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    };

    const renderWorkOrderIdColumn = (_, row) => {
        const maxIdLength = 8;
        const prefix = "0".repeat(maxIdLength - `${row.id}`.length);

        return (
            <div className="dispatch-info-col">
                <p className="col-text">{`${prefix}${row.id}`}</p>
            </div>
        );
    };

    const renderPickupStatus = (_, row) => {
        return (
            <div className="status-switch">
                <Popconfirm title="Are you sure to change the pickup state?" onConfirm={() => switchPickupState(row.id)}>
                    <Switch checked={row.isPickupNeeded} />
                </Popconfirm>
            </div>
        )
    };

    const columns = [
        {
            title: 'Number',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('id'),
            render: renderWorkOrderIdColumn
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '50%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('title'),
            render: (_, row) => <div className="dispatch-info-col"><TagOutlined /><p className="col-text">{row.title}</p></div>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: '30%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('category'),
            render: text => <div className="dispatch-info-col"><FolderOutlined /><p className="col-text">{text}</p></div>
        },
        {
            title: 'Pickup needed',
            dataIndex: 'isPickupNeeded',
            key: 'isPickupNeeded',
            width: '10%',
            sorter: true,
            fixed: 'right',
            sortOrder: getSortOrderPerColumn('isPickupNeeded'),
            render: renderPickupStatus
        }
    ];

    useEffect(() => {
        setIsLoading(true);
        props.setPageInfo(strings.PAGES.WORK_ORDERS_MANAGEMENT);

        getWorkOrders().then(() => {
            setIsLoading(false);
        });
    }, [props.workOrdersSearchRequest]);

    const isEmpty = (!props.paginatedWorkOrders.data || !props.paginatedWorkOrders.data.length) && !props.workOrdersSearchRequest.isFiltered;

    return (
        <>
            <div className="table-top">
                <div className="action-btn-group">
                    {!isEmpty &&
                        <>
                            <h2>{strings.COMMON.SORT_BY}</h2>
                            <CustomBtn name="Number" onClick={() => setSorterPerColumn('id')} type="search" />
                            <CustomBtn name="Title" onClick={() => setSorterPerColumn('title')} type="search" />
                            <CustomBtn name="Category" onClick={() => setSorterPerColumn('category')} type="search" />
                            <CustomBtn name="Pickup Needed" onClick={() => setSorterPerColumn('isPickupNeeded')} type="search" />
                            <SearchInput defaultValue={props.workOrdersSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                            <CustomBtn className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />} />
                        </>
                    }
                </div>
            </div>
            <div className="client-list-layout" style={isEmpty ? { height: '87%' } : {}}>
                <div className="dispatch-table">
                    <Table
                        key="id"
                        rowKey="id"
                        columns={columns}
                        bordered={true}
                        loading={isLoading}
                        scroll={{ x: true }}
                        dataSource={props.paginatedWorkOrders.data}
                        pagination={{
                            current: props.workOrdersSearchRequest.pageNumber,
                            pageSize: props.workOrdersSearchRequest.pageSize,
                            total: props.paginatedWorkOrders.recordsCount,
                            pageSizeOptions: [7, 15, 100, 150, 200],
                            showSizeChanger: true
                        }}
                        onChange={handleTableChange} />
                </div>
            </div>
            <BackTop />
        </>
    );
};

const mapState = ({ workOrdersManagement }) => {
    return {
        paginatedWorkOrders: workOrdersManagement.paginatedWorkOrders,
        workOrdersSearchRequest: workOrdersManagement.workOrdersSearchRequest
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [] }));
        },
        setWorkOrders(workOrders) {
            dispatch(actions.setWorkOrders(workOrders));
        },
        setInitialWorkOrdersSearchRequest() {
            dispatch(actions.setInitialWorkOrdersSearchRequest());
        },
        setWorkOrdersSearchRequestCriteria(value) {
            dispatch(actions.setWorkOrdersSearchRequestCriteria(value));
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
        }
    }
}

export default connect(mapState, mapDispatch)(WorkOrdersList);