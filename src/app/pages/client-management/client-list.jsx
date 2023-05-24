import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { actions } from './client-reducer';
import { CustomBtn, SearchInput, TextCropCell } from '../../components/common/';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { strings, sites, pageNumbers } from '../../constants';
import history from '../../history';
import { Button, Table, notification, Typography, Popconfirm, BackTop } from 'antd';
import {
    UserAddOutlined,
    TeamOutlined,
    SearchOutlined,
    HomeOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { ClientsService } from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import routes from '../routes';
import { formatPhoneNumber } from '../../helpers/text.helper';
import { useDebouncedCallback } from 'use-debounce';

const { Title } = Typography;

const ClientListPage = (props) => {
    const [isEmpty, setIsEmpty] = useState(false);
    const [isClientsLoading, setIsClientsLoading] = useState(false);
    const searchInputRef = useRef('');

    const loadClients = async () => {
        setIsClientsLoading(true);

        try {
            const clientsResponse = await ClientsService.searchByRequest(props.clientsSearchRequest);
            props.setPaginatedClients(clientsResponse.data.data);
            setIsEmpty(clientsResponse.data.data.length === 0 && !props.clientsSearchRequest.isFiltered);
        }
        catch (error) {
            TrackingService.trackException(error);
            console.log(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_CLIENTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsClientsLoading(false);
    };

    useEffect(async () => {
        await loadClients();
    }, [props.clientsSearchRequest])

    useEffect(() => {
        props.setPageInfo(strings.PAGES.CLIENTS, pageNumbers.CLIENT);
        props.setClientSitesName([sites.RONE, sites.JRB]);
    }, []);


    useEffect(() => {
        if (props.paginatedClients.data.some(item => item.site == 'Rone')) {
            props.changeLogoState(true);
        }
        else {
            props.changeLogoState(false);
        }

        if (!props.paginatedClients.data.length) {
            props.changeLogoState(true);
        }
    }, [props.paginatedClients.data])

    const clearSortAndFilters = () => {
        props.setInitialClientsSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setClientsSearchRequestCriteria(searchString);
    }, 400);

    const deleteClient = async (clientId) => {
        setIsClientsLoading(true);

        try {
            await ClientsService.deleteClient(clientId);

            notification['success']({
                message: strings.CLIENT_PAGE.NOTIFICATIONS.DELETE_SUCCESSFUL,
            });

            await loadClients();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.CLIENT_PAGE.NOTIFICATIONS.DELETE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const addClient = () => {
        props.clearEditable();
        history.push(routes.CREATE_EDIT_CLIENT);
    }

    const editClient = (client) => {
        props.setEditingClient(client.id);
        history.push(routes.CREATE_EDIT_CLIENT);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        props.setClientsSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.clientsSearchRequest.sortCriteria === columnName
            ? props.clientsSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }

    const setSorterPerColumn = (columnName) => {
        props.setClientsSearchRequestSorter(columnName, !props.clientsSearchRequest.isAscend);
    }

    const columns = [
        {
            title: 'Company ID',
            dataIndex: 'companyId',
            key: 'companyId',
            width: '6%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('companyId'),
            onCell: (record) => {
                return {
                    onClick: () =>
                        editClient(record)
                }
            },
            render: text => (
                <div className="info-col">
                    <p className="col-text">{text}</p>
                </div>
            )
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
            width: '11%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('company'),
            onCell: (record) => {
                return {
                    onClick: () =>
                        editClient(record)
                }
            },
            render: text => (
                <div className="info-col">
                    <p className="col-text">{text}</p>
                </div>
            )
        },
        {
            title: 'Office Number',
            dataIndex: 'officeNumber',
            key: 'officeNumber',
            width: '6%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('officeNumber'),
            onCell: (record) => {
                return {
                    onClick: () =>
                        editClient(record)
                }
            },
            render: text => {
                return (
                    <div className="info-col">
                        <PhoneOutlined />
                        <p className="col-text">{formatPhoneNumber(text)}</p>
                    </div>
                )
            }
        },
        {
            title: 'Address',
            dataIndex: 'clientAddress',
            key: 'clientAddress',
            width: '16%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('address'),
            editable: true,
            onCell: (record) => {
                return {
                    onClick: () =>
                        editClient(record)
                }
            },
            render: (_, row) => {
                const addressString = [row.state, row.city, row.zipCode, row.address, row.addressLine].join(', ');
                const fullAddress = `Address: ${addressString}. Billing Address:
                                    ${[row.billingCountry, row.billingState, row.billingCity, row.billingZipCode, row.billingAddress, row.billingAddressLine].join(', ')}`;
                return (
                    <div className="info-col">
                            <TeamOutlined />
                            <p className="col-text">{addressString}</p>
                    </div>
                )
            }
        },
        {
            title: 'Contacts',
            dataIndex: 'contacts',
            key: 'contacts',
            width: '12%',
            sorter: false,
            editable: true,
            onCell: (record) => {
                return {
                    onClick: () =>
                        editClient(record)
                }
            },
            render: (_, row) => {
                const employeesString = row.contacts.map(item => item.fullName).join(', ');
                return (
                    (
                        <div className="info-col">
                            <TeamOutlined />
                            <p className="col-text">{employeesString}</p>
                        </div>
                    )
                )
            }
            ,
        },
        {
            key: 'action',
            width: '5%',
            fixed: 'right',
            render: (_, record) => {
                return (
                    <div className="table-actions">
                        <Popconfirm title="Are you sure to delete this record?" onConfirm={() => deleteClient(record.id)}>
                            <Button className="delete-btn" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                )
            },
        }
    ];

    return (
        <>
            <div className="table-top">
                <div className="action-btn-group">
                    {!isEmpty &&
                        <>
                            <h2>{strings.COMMON.SORT_BY}</h2>
                            <CustomBtn name="Company ID" onClick={() => setSorterPerColumn('companyId')} type="search"></CustomBtn>
                            <CustomBtn name="Company" onClick={() => setSorterPerColumn('company')} type="search"></CustomBtn>
                            <CustomBtn name="Office Number" onClick={() => setSorterPerColumn('officeNumber')} type="search"></CustomBtn>
                            <CustomBtn name="Address" onClick={() => setSorterPerColumn('address')} type="search"></CustomBtn>
                            <SearchInput defaultValue={props.clientsSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                            <CustomBtn className="cancel-btn" onClick={clearSortAndFilters} icon={<CloseCircleOutlined />}></CustomBtn>
                        </>
                    }
                </div>
                <div className="add-client-btn">
                    <CustomBtn icon={<UserAddOutlined />} onClick={addClient} type="primary"></CustomBtn>
                </div>
            </div>
            <div className="client-list-layout clients-management-list" style={isEmpty ? { height: '87%' } : {}}>
                {isEmpty
                    ? <div className="add-client">
                        <Title level={4}>{strings.COMMON.EMPTY_CLIENTS}</Title>
                        <CustomBtn icon={<UserAddOutlined />} type="Default" onClick={addClient} name={strings.PAGES.ADD_CLIENT}></CustomBtn>
                    </div>
                    : <div className="client-table">
                        <Table
                            key="id"
                            bordered
                            rowClassName={'custom-table-row'}
                            rowKey="id"
                            showSorterTooltip={false}
                            dataSource={props.paginatedClients.data}
                            columns={columns}
                            loading={isClientsLoading}
                            scroll={{ x: true }}
                            onChange={handleTableChange}
                            pagination={{
                                current: props.clientsSearchRequest.pageNumber,
                                pageSize: props.clientsSearchRequest.pageSize,
                                total: props.paginatedClients.recordsCount,
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

const mapState = ({ clientManagement }) => {
    return {
        clientSites: clientManagement.clientSites,
        filteredSitesForClients: clientManagement.filteredSitesForClients,
        clientsSearchRequest: clientManagement.clientsSearchRequest,
        paginatedClients: clientManagement.paginatedClients
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setEditingClient(id) {
            dispatch(actions.setEditingClient(id));
        },
        clearEditable() {
            dispatch(actions.clearEditable());
        },
        setFilteredSitesForClients(values) {
            dispatch(actions.setFilteredSitesForClients(values));
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value))
        },
        setClientSitesName(values) {
            dispatch(actions.setClientSitesName(values));
        },
        setPaginatedClients(value) {
            dispatch(actions.setPaginatedClients(value));
        },
        setClientsSearchRequestCriteria(value) {
            dispatch(actions.setClientsSearchRequestCriteria(value));
        },
        setInitialClientsSearchRequest() {
            dispatch(actions.setInitialClientsSearchRequest());
        },
        setClientsSearchRequestSorter(property, isAscend) {
            dispatch(actions.setClientsSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setClientsSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setClientsSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        }
    }
}

export default connect(mapState, mapDispatch)(ClientListPage);