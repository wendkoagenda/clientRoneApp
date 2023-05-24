import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { CustomBtn, SearchInput } from '../../components/common/';
import TextCrop from '../../components/common/text-crop';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './dispatch-reducer';
import { pageNumbers, strings } from '../../constants';
import history from '../../history';
import { Button, Table, notification, Popover, Typography, Popconfirm, BackTop, Switch } from 'antd';
import {
    UserOutlined,
    FileOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    NumberOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { DispatchService } from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import routes from '../routes';
import { useDebouncedCallback } from 'use-debounce';
import { cropText } from '../../helpers/text.helper';

const { Title } = Typography;

const DispatchesListPage = (props) => {
    const [isDispatchesLoading, setIsDispatchesLoading] = useState(false);
    const searchInputRef = useRef('');

    const loadDispatches = async () => {
        setIsDispatchesLoading(true);

        try {
            const dispatchResponse = await DispatchService.searchByRequest(props.dispatchesSearchRequest);
            props.setPaginatedDispatches(dispatchResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_DISPATCHES_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsDispatchesLoading(false);
    };

    useEffect(async () => {
        await loadDispatches();
    }, [props.dispatchesSearchRequest]);

    useEffect(async () => {
        props.setPageInfo(strings.PAGES.DISPATCH, pageNumbers.DISPATCH);
    }, []);

    const clearSortAndFilters = () => {
        props.setInitialDispatchesSearchRequest();
        searchInputRef.current.state.value = "";
    }

    const setSearch = useDebouncedCallback((searchString) => {
        props.setDispatchesSearchRequestCriteria(searchString);
    }, 400);

    const addDispatch = () => {
        props.clearEditingDispatch();
        history.push(routes.DISPATCH_MANAGEMENT);
    }

    const clientPopover = (client) => {
        return (
            <div className="details-popover">
                <p>Company: <span>{client.company}</span></p>
                <p>Company id: <span>{client.CompanyId}</span></p>
                <p>Address: <span>{client.address}</span></p>
                <p>City: <span>{client.city}</span></p>
                <p>ZIP: <span>{client.zipCode}</span></p>
                <p>Country: <span>{client.country}</span></p>
            </div>
        )
    }

    const projectPopover = (project) => {
        return (
            <div className="details-popover">
                <p>Name: <span>{project.name}</span></p>
                <p>Address: <span>{project.address}</span></p>
                <p>City: <span>{project.city}</span></p>
                <p>ZIP: <span>{project.zipCode}</span></p>
                <p>Country: <span>{project.country}</span></p>
            </div>
        )
    }

    const workOrdersPopover = (workOrders) => {
        return (
            <div className="details-popover">
                {workOrders.map(item =>
                    <div key={item.id} className="order-container">
                        <p>Order Id: <span>{item.id}</span></p>
                        <p>Title: <span>{item.title}</span></p>
                        <p>Category: <span>{item.category}</span></p>
                    </div>
                )}
            </div>
        )
    }

    const deleteDispatch = async (dispatchId) => {
        setIsDispatchesLoading(true);

        try {
            await DispatchService.deleteDispatchRequest(dispatchId);

            notification['success']({
                message: strings.COMMON.DISPATCH_DELETED,
            });

            await loadDispatches();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.DELETE_DISPATCH_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsDispatchesLoading(false);
        }
    }

    const editDispatch = (dispatchId) => {
        props.clearEditingDispatch();
        props.setEditingDispatch(dispatchId);
        history.push(routes.DISPATCH_MANAGEMENT);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        props.setDispatchesSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.dispatchesSearchRequest.sortCriteria === columnName
            ? props.dispatchesSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }

    const setSorterPerColumn = (columnName) => {
        props.setDispatchesSearchRequestSorter(columnName, !props.dispatchesSearchRequest.isAscend);
    }

    const columns = [
        {
            title: 'Work Orders',
            dataIndex: 'workOrders',
            key: 'workOrderId',
            width: '30%',
            sorter: true,
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.id)
                }
            },
            render: text => {
                const workOrdersString = text.map(item => item.title).join(', ');
                return (
                    <div className={`dispatch-info-col ${workOrdersString ? "" : "all-work-orders-are-completed"}`}>
                        <NumberOutlined />
                        {workOrdersString.length > 40
                            ? <Popover content={workOrdersPopover(text)}>
                                <p className="col-text">{cropText(workOrdersString, 40)}</p>
                            </Popover>
                            : <p className="col-text">
                                {workOrdersString 
                                    ? workOrdersString 
                                    : strings.DISPATCH.LABELS.ALL_WORK_ORDERS_ARE_COMPLETED}
                            </p>
                        }
                    </div>
                )
            }
        },
        {
            title: 'Business Party',
            dataIndex: 'client',
            key: 'client',
            width: '30%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('client.company'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.id)
                }
            },
            render: text =>
                <div className="dispatch-info-col">
                    <p className="col-text">{text.company}</p>
                </div>
        },
        {
            title: 'Project',
            dataIndex: 'project',
            key: 'project',
            width: '30%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('project.name'),
            onCell: (record) => {
                return {
                    onClick: () => editDispatch(record.id)
                }
            },
            render: text =>
                <Popover content={projectPopover(text)}>
                    <div className="dispatch-info-col">
                        <FileOutlined />
                        <p className="col-text">{text.name}</p>
                    </div>
                </Popover>
        },
        {
            key: 'action',
            width: '8%',
            render: (_, record) => {
                return (
                    <div className="table-actions">
                        <Popconfirm title="Are you sure to delete this record?" onConfirm={() => deleteDispatch(record.id)}>
                            <Button className="delete-btn" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                )
            },
        }
    ];

    const isEmpty = (!props.paginatedDispatches.data || !props.paginatedDispatches.data.length) && !props.dispatchesSearchRequest.isFiltered;

    return (
        <>
            <div className="table-top">
                <div className="action-btn-group">
                    {!isEmpty &&
                        <>
                            <h2>{strings.COMMON.SORT_BY}</h2>
                            <CustomBtn name="Business Party" onClick={() => setSorterPerColumn('client.company')} type="search" />
                            <CustomBtn name="Project" onClick={() => setSorterPerColumn('project.name')} type="search" />
                            <SearchInput defaultValue={props.dispatchesSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                            <CustomBtn className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />} />
                            <div className="temporary-filters">
                                <Switch
                                    checkedChildren={strings.DISPATCH.LABELS.TEMPORARY_CLIENT}
                                    unCheckedChildren={strings.DISPATCH.LABELS.TEMPORARY_CLIENT}
                                    checked={props.dispatchesSearchRequest.isTemporaryClient}
                                    onClick={props.setTemporaryClientSearchRequest}
                                />
                                <Switch
                                    checkedChildren={strings.DISPATCH.LABELS.TEMPORARY_SITE}
                                    unCheckedChildren={strings.DISPATCH.LABELS.TEMPORARY_SITE}
                                    checked={props.dispatchesSearchRequest.isTemporarySite}
                                    onClick={props.setTemporarySiteSearchRequest}
                                />
                            </div>
                        </>
                    }
                </div>
                <div className="add-client-btn work-orders-btn-action-group">
                    <CustomBtn name="Work Orders" className="work-order-action-btn" icon={<UnorderedListOutlined style={{ fontSize: '18px' }} />} onClick={() => history.push(routes.WORK_ORDERS)} type="primary" />
                    <CustomBtn icon={<EnvironmentOutlined style={{ fontSize: '18px' }} />} onClick={addDispatch} type="primary" />
                </div>
            </div>
            <div className="client-list-layout" style={isEmpty ? { height: '87%' } : {}}>
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
                            rowClassName={'custom-dispatch-table-row'}
                            showSorterTooltip={false}
                            dataSource={props.paginatedDispatches.data}
                            columns={columns}
                            loading={isDispatchesLoading}
                            onChange={handleTableChange}
                            pagination={{
                                current: props.dispatchesSearchRequest.pageNumber,
                                pageSize: props.dispatchesSearchRequest.pageSize,
                                total: props.paginatedDispatches.recordsCount,
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

const mapState = ({ dispatch }) => {
    return {
        isFiltering: dispatch.isFiltering,
        filteredString: dispatch.filteredString,
        dispatchesSearchRequest: dispatch.dispatchesSearchRequest,
        paginatedDispatches: dispatch.paginatedDispatches
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        clearEditingDispatch() {
            dispatch(actions.clearEditingDispatch());
        },
        setEditingDispatch(id) {
            dispatch(actions.setEditingDispatch(id));
        },
        setTemporaryClientSearchRequest(value) {
            dispatch(actions.setTemporaryClientSearchRequest(value));
        },
        setTemporarySiteSearchRequest(value) {
            dispatch(actions.setTemporarySiteSearchRequest(value));
        },
        setPaginatedDispatches(value) {
            dispatch(actions.setPaginatedDispatches(value));
        },
        setDispatchesSearchRequestCriteria(value) {
            dispatch(actions.setDispatchesSearchRequestCriteria(value));
        },
        setInitialDispatchesSearchRequest() {
            dispatch(actions.setInitialDispatchesSearchRequest());
        },
        setDispatchesSearchRequestSorter(property, isAscend) {
            dispatch(actions.setDispatchesSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setDispatchesSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setDispatchesSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        }
    }
}

export default connect(mapState, mapDispatch)(DispatchesListPage);