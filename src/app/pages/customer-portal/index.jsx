import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../components/user-manage-table/user-management-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { EditableCell } from '../../components/user-manage-table/editable-cell';
import { SearchInput, CustomBtn, TextCropCell, CustomSingleOptionSelect } from '../../components/common';
import { roles, strings } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import { UserManagement, GlobalService, IdentityService, TrackingService, CustomerPortalService } from '../../services';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
import {
    Table,
    Form,
    notification,
    Spin,
    BackTop,
} from 'antd';
import {
    SearchOutlined,
    FileMarkdownOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
    MailOutlined,
    UserOutlined,
    LoadingOutlined,
    FilterOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

import { useDebouncedCallback } from 'use-debounce';
import routes from '../routes';
import history from '../../history';
import AddUserModal from '../../components/user-manage-table/add-user-modal';

const CustomersListPage = (props) => {
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const searchInputRef = useRef('');
    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const getUsers = async () => {
        try {
            const getUsersResponse = await CustomerPortalService.searchByRequest(props.usersSearchRequest);
            props.setPaginatedUsers(getUsersResponse.data.data);
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.GET_USERS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    }

    const setAllSites = async () => {
        try {
            const sitesResponse = await GlobalService.getAllSites();
            props.setSites(sitesResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            props.setSites([]);
        }
    }

    const setAdminIdentity = async () => {
        try {
            const userIdentityResponse = await IdentityService.getIdentity();
            props.setCurrentUser(userIdentityResponse.user);
        }
        catch (error) {
            TrackingService.startTrackEvent(error);
            props.setCurrentUser([]);
        }
    }

    useEffect(() => {
        setIsUsersLoading(true);
        getUsers().then(() => {
            setIsUsersLoading(false);
        });
    }, [props.usersSearchRequest]);

    useEffect(async () => {
        await setAllSites();
        await setAdminIdentity();
        props.setPageInfo(strings.PAGES.CUSTOMER_PORTAL);
    }, []);

    const setFieldsValue = (value) => {
        form.setFields(value);
    }

    const setSearch = useDebouncedCallback((searchString) => {
        props.setUsersSearchRequestCriteria(searchString);
    }, 400);

    const clearSortAndFilters = () => {
        props.setInitialUsersSearchRequest();
        searchInputRef.current.state.value = "";
    }

    const handleTableChange = (pagination, filters, sorter) => {
        props.setUsersSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.usersSearchRequest.sortCriteria === columnName
            ? props.usersSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }

    const setSorterPerColumn = (columnName) => {
        props.setUsersSearchRequestSorter(columnName, !props.usersSearchRequest.isAscend);
    }

    const onSiteSearchSubmitted = () => {
        props.setFilteredSites();
    };

    const manageProjects = async (userId) => {
        history.push(routes.GET_USER_MANAGE_PROJECTS(userId));
    }

    const populateWithContacts = async _ => {
        try {
            const response = await CustomerPortalService.populateWithCustomers();
        }
        catch (error) {
            TrackingService.startTrackEvent(error);
        }
    }

    const columns = [
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
            width: '5%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('userName'),
            editable: false,
            render: text => <div className="info-col"><p className="col-text">{text}</p></div>
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '10%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('fullName'),
            editable: false,       
            render: text => <div className="info-col"><UserOutlined /><p className="col-text">{text}</p></div>
        },
        {
            title: 'Site',
            dataIndex: 'sites',
            key: 'sites',
            width: '9%',
            sorter: false,
            sortOrder: getSortOrderPerColumn('sites'),
            render: text => {
                const sitesString = props.sites.filter(item => text.some(obj => obj == item.id)).map(o => o.name).join(', ');
                return (
                    <TextCropCell icon={<EnvironmentOutlined />} title="Sites" inputString={sitesString} />
                )
            },
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <FilterBySiteDropdown value={props.filteredSites} isById={true} onChange={props.setFilteredSitesForUsers} option='sites' submit={onSiteSearchSubmitted} />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '17%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('email'),
            editable: false,
            render: text => <div className="info-col"><MailOutlined /><p className="col-text">{text}</p></div>
        },
        {
            title: 'Manage projects',
            dataIndex: 'actions',
            key: 'actions',
            width: '10%',
            editable: false,
            className: 'manage-projects-column',
            onCell:(row) => {
                return {
                    onClick:() => manageProjects(row.id)
                }
            },
            render: _ =>  <div className="info-col"><FileMarkdownOutlined /><p className="col-text">{strings.USERS.PLACEHOLDERS.MANAGE_PROJECTS}</p></div>
        },
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                sites: props.sites,
                roles: props.roles,
                record,
                inputType: col.dataIndex == 'sites' || col.dataIndex == 'role' ? 'list' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                setValues: setFieldsValue
            }),
        };
    });

    return (
        <>
            <div className="table-top">
                <div className="action-btn-group">
                    <h2>{strings.COMMON.SORT_BY}</h2>
                    <CustomBtn name="User Name" onClick={() => setSorterPerColumn('userName')} type="search"></CustomBtn>
                    <CustomBtn name="Full Name" onClick={() => setSorterPerColumn('fullName')} type="search"></CustomBtn>
                    <CustomBtn name="Email" onClick={() => setSorterPerColumn('email')} type="search"></CustomBtn>
                    <SearchInput placeholder="Custom Search" defaultValue={props.usersSearchRequest.searchCriteria} searchInputRef={searchInputRef} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                    <CustomBtn className="cancel-btn" icon={<CloseCircleOutlined />} onClick={clearSortAndFilters}></CustomBtn>
                </div>
                <div className="add-btn-group">
                    <CustomBtn type="primary" name="Populate with contacts" onClick={_ => populateWithContacts()}></CustomBtn>
                    <CustomBtn icon={<PlusCircleOutlined />} style={{ width: '40px' }} onClick={_ => setIsModalVisible(true)} type="primary"></CustomBtn>
                </div>
            </div>
            {props.isLoading
                ? <div className="table-spinner">
                    <Spin indicator={loadingIcon} />
                </div>
                : <div className="customer-portal-layout">
                    <Form form={form} component={false}>
                        <Table
                            bordered
                            rowClassName={'custom-table-row'}
                            key="id"
                            rowKey="id"
                            showSorterTooltip={false}
                            dataSource={props.paginatedUsers.data}
                            scroll={{ x: true }}
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                            columns={mergedColumns}
                            loading={isUsersLoading}
                            onChange={handleTableChange}
                            pagination={{
                                current: props.usersSearchRequest.pageNumber,
                                pageSize: props.usersSearchRequest.pageSize,
                                total: props.paginatedUsers.recordsCount,
                                pageSizeOptions: [7, 10, 15, 20],
                                showSizeChanger: true
                            }}
                        />
                    <AddUserModal visible={isModalVisible} handleCancel={() => setIsModalVisible(false)} updateUsers={getUsers} />
                    </Form>
                </div>
            }
            <BackTop />
        </>
    )
}

const mapState = ({ userManagement, authorizedLayout }) => {
    return {
        filteredSites: userManagement.filteredSites,
        filteredRoles: userManagement.filteredRoles,
        isLoading: userManagement.isLoading,
        filteredUsers: userManagement.filteredUsers,
        admin: userManagement.currentUser,
        allSites: authorizedLayout.allSites,
        allRoles: authorizedLayout.allRoles,
        sites: userManagement.sites,
        roles: userManagement.roles,
        usersSearchRequest: userManagement.usersSearchRequest,
        paginatedUsers: userManagement.paginatedUsers
    };
}

const mapDispatch = (dispatch) => {
    return {
        updateUsers() {
            dispatch(actions.updateUsers());
        },
        startLoading() {
            dispatch(actions.startLoading());
        },
        endLoading() {
            dispatch(actions.endLoading());
        },
        setFilteredUsers(value, searchString) {
            dispatch(actions.setFilteredUsers(value, searchString));
        },
        setFiltering() {
            dispatch(actions.setFiltering());
        },
        disableFiltering() {
            dispatch(actions.disableFiltering());
        },
        setSites(value) {
            dispatch(actions.setSites(value));
        },
        setRoles(value) {
            dispatch(actions.setRoles(value));
        },
        setCurrentUser(value) {
            dispatch(actions.setCurrentUser(value));
        },
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setFilteredSites(values) {
            dispatch(actions.setFilteredSites(values));
        },
        setFilteredRoles(values) {
            dispatch(actions.setFilteredRoles(values));
        },
        setFilteredRolesForUsers(values) {
            dispatch(actions.setFilteredRolesForUsers(values));
        },
        setFilteredSitesForUsers(values) {
            dispatch(actions.setFilteredSitesForUsers(values));
        },
        setPaginatedUsers(value) {
            dispatch(actions.setPaginatedUsers(value));
        },
        setUsersSearchRequestCriteria(value) {
            dispatch(actions.setUsersSearchRequestCriteria(value));
        },
        setInitialUsersSearchRequest() {
            dispatch(actions.setInitialUsersSearchRequest());
        },
        setUsersSearchRequestSorter(sortCriteria, isAscend) {
            dispatch(actions.setUsersSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: sortCriteria
            }));
        },
        setUsersSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setUsersSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        }
    }
}

export default connect(mapState, mapDispatch)(CustomersListPage);