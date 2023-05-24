import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../components/user-manage-table/user-management-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { EditableCell } from '../../components/user-manage-table/editable-cell';
import { SearchInput, CustomBtn, TextCropCell, CustomSingleOptionSelect } from '../../components/common';
import AddUserModal from '../../components/user-manage-table/add-user-modal';
import { roles, strings } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import { UserManagement, GlobalService, IdentityService, TrackingService } from '../../services';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
import {
    Table,
    Form,
    Popconfirm,
    notification,
    Spin,
    Switch,
    Button,
    BackTop,
    Checkbox
} from 'antd';
import {
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
    MailOutlined,
    CheckCircleOutlined,
    UserOutlined,
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
    FilterOutlined
} from '@ant-design/icons';
import UserSignatureAdminComponent from './user-signature-admin.component';
import EditUserModal from './update-user.modal';
import { useDebouncedCallback } from 'use-debounce';

const UserManagementPage = (props) => {
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editModalProps, setEditModalProps] = useState({ visible: false, row: null });
    const [signatureComponent, setSignatureComponent] = useState({ modalVisible: false, userId: null });
    const searchInputRef = useRef('');
    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const getUsers = async () => {
        try {
            const getUsersResponse = await UserManagement.searchByRequest(props.usersSearchRequest);
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

    const setAllRoles = async () => {
        try {
            const rolesResponse = await GlobalService.getAllRoles();
            props.setRoles(rolesResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            props.setRoles([]);
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
        await setAllRoles();
        await setAdminIdentity();
        props.setPageInfo(strings.PAGES.USER_MANAGEMENT);
    }, []);

    const isEditing = (record) => record.id === editingKey;

    const setFieldsValue = (value) => {
        form.setFields(value);
    }

    const cancel = () => {
        setEditingKey('');
    };

    const deleteUser = async (userId) => {
        try {
            props.startLoading();
            await UserManagement.deleteUser(userId);

            notification['success']({
                message: strings.COMMON.DELETE_SUCCESSFUL,
            });

            await getUsers();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.DELETE_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    }

    const save = async (userId) => {
        let editUserModel = await form.validateFields();
        const parsedSites = editUserModel.sites.map((i) => Number(i));
        editUserModel.sites = parsedSites;
        editUserModel.id = userId;

        const prevUserModel = props.paginatedUsers.data.find(item => item.id == userId);

        editUserModel = {
            ...editUserModel,
            isDisabled: prevUserModel.isDisabled,
            canSync: prevUserModel.canSync,
            signatureUrl: prevUserModel.signatureUrl
        }

        try {
            props.startLoading();
            setEditingKey('');
            const editingResponse = await UserManagement.editUser(editUserModel);

            if (editingResponse.status == 200) {
                notification['success']({
                    message: strings.COMMON.EDIT_SUCCESSFUL,
                });
            }

            await getUsers();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setUsersSearchRequestCriteria(searchString);
    }, 400);

    const clearSortAndFilters = () => {
        props.setInitialUsersSearchRequest();
        searchInputRef.current.state.value = "";
    }

    const renderSwitchCell = (checked, confirmText, onChange) => {
        return (
            <Popconfirm placement="top" title={confirmText} onConfirm={() => onChange(!checked)} okText={strings.COMMON.OK} cancelText={strings.COMMON.CANCEL}>
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={checked}
                />
            </Popconfirm>
        );
    }

    const renderRootSiteCell = (row) => {
        if (row.role != roles.TECHNICIAN) {
            return <></>;
        }

        const siteSelectOptions = props.sites.map(site => {
            return {
                key: site.id,
                value: site.id,
                displayValue: site.name
            };
        });

        const onRootSiteChanged = async (userId, value) => {
            try {
                props.startLoading();

                const selectedUser = {
                    ...props.paginatedUsers.data.find(item => item.id == userId),
                    rootSiteId: value
                };

                const editingResponse = await UserManagement.editUser(selectedUser);

                if (editingResponse.status == 200) {
                    notification['success']({
                        message: strings.COMMON.EDIT_SUCCESSFUL,
                    });
                }

                await getUsers();
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_ERROR);
                notification['error']({
                    message: errorMessage,
                });

                TrackingService.trackException(error);
            }
        }

        return (
            <CustomSingleOptionSelect handleChange={(value) => onRootSiteChanged(row.id, value)} placeholder={strings.COMMON.SITE} value={row.rootSiteId} options={siteSelectOptions} />
        );
    }

    const onUserDisabledStateChanged = async (userId, isDisabled) => {
        try {
            props.startLoading();

            await UserManagement.changeUserDisabledState(userId)
            notification['success']({
                message: strings.COMMON.DISABLED_STATE_CHANGE_SUCCESS,
            });

            await getUsers();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.DISABLED_STATE_CHANGE_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        props.endLoading();
    }

    const onUserCanSyncStateChanged = async (userId, canSync) => {
        try {
            props.startLoading();

            const selectedUser = {
                ...props.paginatedUsers.data.find(item => item.id == userId),
                canSync: canSync
            };

            await UserManagement.changeUserCanSyncState(selectedUser.id);

            notification['success']({
                message: strings.COMMON.CANSYNC_STATE_CHANGE_SUCCESS,
            });

            await getUsers();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.CANSYNC_STATE_CHANGE_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        props.endLoading();
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

    const renderSignature = (cell, row) => {
        return row.role == roles.PROJECT_MANAGER ? <CustomBtn name="Upload" onClick={() => setSignatureComponent({ modalVisible: true, userId: row.id })} type="search" /> : <></>;
    };

    const onSignatureUploadFinished = async () => {
        setSignatureComponent({ modalVisible: false, userId: null });
        await getUsers();
    }

    const handleEditModalOk = () => {
        setEditModalProps({
            visible: false,
            record: null
        });
    }

    const handleEditModalCancel = () => {
        setEditModalProps({
            visible: false,
            record: null
        });
    }

    const handleEditModalOpen = (row) => {
        setEditModalProps({
            visible: true,
            record: row
        })
    }

    const onSiteSearchSubmitted = () => {
        props.setFilteredSites();
    };

    const onRoleSearchSubmitted = () => {
        props.setFilteredRoles();
    };

    const columns = [
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
            width: '5%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('userName'),
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: text => <div className="info-col"><p>{text}</p></div>
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '10%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('fullName'),
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: text => <div className="info-col">
                                <UserOutlined />
                                <p className="col-text">{text}</p>
                            </div>
        },
        {
            title: 'Disabled',
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            width: '4%',
            editable: false,
            render: (_, row) => renderSwitchCell(row.isDisabled, strings.COMMON.DISABLE_USER_CONFIRM_TEXT(row.isDisabled), (checked) => onUserDisabledStateChanged(row.id, checked))
        },
        {
            title: 'Can Sync',
            dataIndex: 'canSync',
            key: 'canSync',
            width: '5%',
            editable: false,
            render: (_, row) => renderSwitchCell(row.canSync, strings.COMMON.CAN_SYNC_USER_CONFIRM_TEXT(!row.canSync), (checked) => onUserCanSyncStateChanged(row.id, checked))
        },
        {
            title: 'Signature',
            dataIndex: 'signatureUrl',
            key: 'signatureUrl',
            width: '4%',
            editable: false,
            render: renderSignature
        },
        {
            title: 'Title',
            dataIndex: 'signatureTitle',
            key: 'signatureTitle',
            width: '8%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('signatureTitle'),
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: (_, row) => row.role == roles.PROJECT_MANAGER ? <div className="info-col"><p className="col-text">{row.signatureTitle}</p></div> : <></>
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            width: '11%',
            sorter: false,
            sortOrder: getSortOrderPerColumn('roles'),
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: (_, row) => {
                const rolesString = row.roles?.join(', ');
                return (
                    <div className="info-col"><p className="col-text">{rolesString}</p></div>
                )
            },
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <div className="checkbox-dropdown">
                    <Checkbox.Group style={{ width: '100%' }} value={props.filteredRoles} onChange={(values) => props.setFilteredRolesForUsers(values)}>
                        {props.roles.map(item =>
                            <Checkbox key={item.id} value={item.id}>{item.name}</Checkbox>
                        )}

                        <Button type="primary" onClick={onRoleSearchSubmitted}>Search</Button>
                    </Checkbox.Group>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />,
        },
        {
            title: 'Site',
            dataIndex: 'sites',
            key: 'sites',
            width: '9%',
            sorter: false,
            sortOrder: getSortOrderPerColumn('sites'),
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: text => {
                const sitesString = props.sites.filter(item => text.some(obj => obj == item.id)).map(o => o.name)?.join(', ');
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
            title: 'Root Site',
            dataIndex: 'rootSiteId',
            key: 'rootSiteId',
            width: '12%',
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: (_, row) => renderRootSiteCell(row)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '17%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('email'),
            editable: false,
            onCell: (record) => {
                return {
                    onClick: () => handleEditModalOpen(record)
                }
            },
            render: text => <div className="info-col"><MailOutlined /><p className="col-text">{text}</p></div>
        },
        {
            key: 'action',
            width: '6%',
            fixed: 'right',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable
                    ?
                    (<div className="table-actions">
                        <Popconfirm title="Sure to edit?" onConfirm={() => save(record.id)}>
                            <Button icon={<CheckCircleOutlined style={{ color: '#00DC7D' }} />} />
                        </Popconfirm>
                        <Button className="delete-btn" onClick={cancel} icon={<CloseCircleOutlined style={{ color: '#FF0000' }} />} />
                    </div>)
                    :
                    (<div className="table-actions">
                        {
                            props.admin.email === record.email ? (
                                <Button className="delete-btn" disabled={true} icon={<DeleteOutlined />} />
                            ) : (
                                <Popconfirm title="Are you sure to delete this record?" onConfirm={() => deleteUser(record.id)}>
                                    <Button className="delete-btn" icon={<DeleteOutlined />} />
                                </Popconfirm>
                            )
                        }
                    </div>
                    )
            },
        }
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
                editing: isEditing(record),
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
                    <CustomBtn name="Title" onClick={() => setSorterPerColumn('signatureTitle')} type="search"></CustomBtn>
                    <SearchInput placeholder="Custom Search" defaultValue={props.usersSearchRequest.searchCriteria} searchInputRef={searchInputRef} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined />} />
                    <CustomBtn className="cancel-btn" icon={<CloseCircleOutlined />} onClick={clearSortAndFilters}></CustomBtn>
                </div>
                <CustomBtn icon={<PlusCircleOutlined />} style={{ width: '40px' }} onClick={() => setIsModalVisible(true)} type="primary"></CustomBtn>
            </div>
            {props.isLoading
                ? <div className="table-spinner">
                    <Spin indicator={loadingIcon} />
                </div>
                : <div className="user-manage-layout">
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
                                pageSizeOptions: [7, 10, 100, 150, 200],
                                showSizeChanger: true
                            }}
                        />
                    </Form>
                    <AddUserModal visible={isModalVisible} handleCancel={() => setIsModalVisible(false)} updateUsers={getUsers} />
                </div>
            }
            <EditUserModal editModalVisible={editModalProps} updateUsers={getUsers} handleOk={handleEditModalOk} handleCancel={handleEditModalCancel} />
            <UserSignatureAdminComponent
                visible={signatureComponent.modalVisible}
                onClose={() => setSignatureComponent({ modalVisible: false, userId: null })}
                onUploadFinished={onSignatureUploadFinished}
                userId={signatureComponent.userId} />
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

export default connect(mapState, mapDispatch)(UserManagementPage);