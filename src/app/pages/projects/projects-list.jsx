import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { SearchInput, CustomBtn, TextCropCell } from '../../components/common';
import { actions } from '../projects/projects-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { strings, sites, pageNumbers } from '../../constants';
import { ProjectsService } from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import {
    Table,
    notification,
    Switch,
    Button,
    Popconfirm,
    Radio,
    BackTop
} from 'antd';
import {
    FileAddOutlined,
    SearchOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    TeamOutlined,
    UserOutlined,
    FilterOutlined
} from '@ant-design/icons';
import history from '../../history';
import routes from '../routes';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
import { useDebouncedCallback } from 'use-debounce';
import TextCrop from '../../components/common/text-crop';


const filterToggleStatuses = {
    ALL: 'All',
    TEMPORARY: 'Temporary',
    TEMPORARY_CLIENT: 'Temporary Business Party',
    TEMPORARY_SITE: 'Temporary Site',
    DEFAULT: 'Default'
}

const ProjectsListPage = (props) => {
    const {
        setPageInfo,
        paginatedProjects,
        changeLogoState,
        setPaginatedProjects,
        projectsSearchRequest
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);

    const searchInputRef = useRef('');

    const clearSortAndFilters = () => {
        props.setInitialProjectsSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const onSearch = useDebouncedCallback((searchString) => {
        props.setProjectsSearchRequestCriteria(searchString);
    }, 400);

    const onProjectAdd = () => {
        props.clearEditable();
        history.push(routes.GET_PROJECT_MANAGEMENT_ROUTE('new'));
    };

    const changeProjectStatus = async (projectId) => {
        setIsLoading(true);

        const project = props.paginatedProjects.data.find(item => item.id == projectId);

        try {
            await ProjectsService.editProject({
                ...project,
                clientIds: project.clients.map(item => item.id),
                contactIds: project.contacts.map(item => item.id),
                isActive: !project.isActive,
                primaryClientId: project.clients.find(item => item.isPrimary).id
            });

            notification['success']({
                message: strings.PROJECTS.NOTIFICATIONS.EDIT_SUCCESSFUL,
            });

            await loadProjects();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.CHANGE_STATUS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsLoading(false);
        }
    }

    const changeProjectTempStatus = async (projectId) => {
        setIsLoading(true);

        const project = props.paginatedProjects.data.find(item => item.id == projectId);

        try {
            await ProjectsService.editProject({
                ...project,
                clientIds: project.clients.map(item => item.id),
                contactIds: project.contacts.map(item => item.id),
                isTemporary: !project.isTemporary,
                primaryClientId: project.clients.find(item => item.isPrimary).id
            });

            notification['success']({
                message: strings.PROJECTS.NOTIFICATIONS.EDIT_SUCCESSFUL,
            });

            await loadProjects();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.CHANGE_STATUS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsLoading(false);
        }
    }

    const deleteProject = async (projectId) => {
        setIsLoading(true);

        try {
            await ProjectsService.deleteProject(projectId);

            notification['success']({
                message: strings.COMMON.PROJECT_DELETED
            });

            await loadProjects();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.DELETE_PROJECT_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsLoading(false);
        }
    }

    const editProject = async (projectId) => {
        props.setEditProjectId(projectId);
        history.push(routes.GET_PROJECT_MANAGEMENT_ROUTE(projectId));
    }

    const renderProjectSite = (cell, row) => {
        return (
            <div className="info-col">
                <EnvironmentOutlined />
                <TextCrop inputString={row.site.name} title="Project Site" />
            </div>
        );
    };

    const renderProjectStatus = (cell, row) => {
        return (
            <div className="status-switch">
                <Popconfirm title="Are you sure to change the project status?" onConfirm={() => changeProjectStatus(row.id)}>
                    <Switch checked={row.isActive} />
                </Popconfirm>
            </div>
        )
    };

    const renderProjectTempStatus = (cell, row) => {
        return (
            <div className="status-switch">
                <Popconfirm title="Are you sure want to change the project temporary state?" onConfirm={() => changeProjectTempStatus(row.id)}>
                    <Switch checked={row.isTemporary} />
                </Popconfirm>
            </div>
        );
    };

    const renderActionsColumn = (cell, row) => {
        return (
            <div className="table-actions">
                <Popconfirm title="Are you sure to delete this record?" onConfirm={() => deleteProject(row.id)}>
                    <Button className="delete-btn" icon={<DeleteOutlined />} />
                </Popconfirm>
            </div>
        )
    };

    const TempProjectFilterButton = ({ selectedValue, onChange }) => {
        return (
            <Radio.Group className="temporary-select-group" value={selectedValue} onChange={(e) => onChange(e.target.value)}>
                <Radio.Button className="temporary-select-label temporary-select-left-label" value={filterToggleStatuses.ALL}>{filterToggleStatuses.ALL}</Radio.Button>
                <Radio.Button className="temporary-select-label" value={filterToggleStatuses.TEMPORARY}>{filterToggleStatuses.TEMPORARY}</Radio.Button>
                <Radio.Button className="temporary-select-label" value={filterToggleStatuses.TEMPORARY_CLIENT}>{filterToggleStatuses.TEMPORARY_CLIENT}</Radio.Button>
                <Radio.Button className="temporary-select-label" value={filterToggleStatuses.TEMPORARY_SITE}>{filterToggleStatuses.TEMPORARY_SITE}</Radio.Button>
                <Radio.Button className="temporary-select-label temporary-select-right-label" value={filterToggleStatuses.DEFAULT}>{filterToggleStatuses.DEFAULT}</Radio.Button>
            </Radio.Group>
        );
    }

    const temporaryFilterChange = (value) => {
        if (value === filterToggleStatuses.ALL) {
            props.setAllProjectSearchRequest();
        }

        if (value === filterToggleStatuses.TEMPORARY) {
            props.setProjectSearchRequestStatus(true);
        }

        if (value === filterToggleStatuses.TEMPORARY_CLIENT) {
            props.setTemporaryClientStatus(true);
        }

        if (value === filterToggleStatuses.TEMPORARY_SITE) {
            props.setTemporarySiteStatus(true);
        }

        if (value === filterToggleStatuses.DEFAULT) {
            props.setProjectSearchRequestStatus(false);
        }
    }

    const getSortOrderPerColumn = (columnName) => {
        return props.projectsSearchRequest.sortCriteria === columnName
            ? props.projectsSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }

    const setSorterPerColumn = (columnName) => {
        props.setProjectsSearchRequestSorter(columnName, !props.projectsSearchRequest.isAscend);
    }

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setProjectsSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const onSiteSearchSubmitted = () => {
        props.setFilteredSites();
    };

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'name',
            key: 'name',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('name'),
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <p className="col-text">{row.name}</p>
                </div>
            ), [row.name]),
        },
        {
            title: 'Project Number',
            dataIndex: 'number',
            key: 'number',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('number'),
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <p className="col-text">{row.number}</p>
                </div>
            ), [row.number]),
        },
        {
            title: 'Address',
            key: 'address',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('address'),
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <HomeOutlined />
                    <p className="col-text">{[row.state, row.city, row.zipCode, row.address, row.addressLine].join(', ')}</p>
                </div>
            ), [row.state, row.city, row.zipCode, row.address, row.addressLine]),
        },
        {
            title: 'Business Party Assigned',
            dataIndex: 'clients',
            key: 'clients',
            className: 'project-page-col',
            sorter: true,
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <TeamOutlined />
                    <p className="col-text">{row.clients.map(item => item.company).join(', ')}</p>
                </div>
            ), [row.clients])
        },
        {
            title: 'Contact Assigned',
            dataIndex: 'contacts',
            key: 'contacts',
            width: '10%',
            className: 'project-page-col',
            sorter: true,
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <TeamOutlined />
                    <p className="col-text">{row.contacts.map(item => item.fullName).join(', ')}</p>
                </div>
            ), [row.contacts]),
        },
        {
            title: 'Project Manager',
            dataIndex: 'projectManager',
            key: 'projectManager',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('projectManager.fullName'),
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() => (
                <div className="info-col">
                    <UserOutlined />
                    <p className="col-text">{row.projectManagerId ? row.projectManager.userName : "N/A"}</p>
                </div>
            ), [row.projectManagerId]),
        },
        {
            title: 'Site',
            dataIndex: 'site',
            key: 'site',
            sorter: true,
            sortOrder: getSortOrderPerColumn('site.name'),
            onCell: (row) => {
                return {
                    onClick: () => editProject(row.id)
                }
            },
            render: (_, row) => useMemo(() =>(
                <div className="info-col">
                    <EnvironmentOutlined />
                    <p className="col-text">{row.site.name}</p>
                </div>
            ), [row.site.name]),
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <FilterBySiteDropdown value={props.filteredSites} onChange={props.setPreparedFilteredSites} submit={onSiteSearchSubmitted} />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            fixed: 'right',
            sorter: true,
            sortOrder: getSortOrderPerColumn('isActive'),
            render: renderProjectStatus
        },
        {
            title: 'Temporary',
            dataIndex: 'isTemporary',
            key: 'isTemporary',
            fixed: 'right',
            sorter: true,
            render: renderProjectTempStatus
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            fixed: 'right',
            render: renderActionsColumn
        }
    ];

    const loadProjects = useCallback(async () => {
        setIsLoading(true);

        try {
            const paginatedProjectResponse = await ProjectsService.searchByRequest(projectsSearchRequest);
            setIsLoading(false);
            setPaginatedProjects(paginatedProjectResponse.data.data);
            setIsEmpty(paginatedProjectResponse.data.data.length === 0 && !props.projectsSearchRequest.isFiltered);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsLoading(false);
        }
    }, [projectsSearchRequest, setPaginatedProjects]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects, projectsSearchRequest])

    useEffect(() => {
        setPageInfo({ name: strings.PAGES.PROJECTS, sidebarKey: [pageNumbers.PROJECTS] });
    }, [setPageInfo]);

    useEffect(() => {
        if (paginatedProjects.data.some(item => !(item.site.name.includes(sites.JRB)))) {
            changeLogoState(true);
        }
        else {
            changeLogoState(false);
        }

        if (!paginatedProjects.data.length) {
            changeLogoState(true);
        }
    }, [changeLogoState, paginatedProjects])

    const getProjectStatusValue = () => {
        if (props.projectsSearchRequest.isTemporary != null) {
            return props.projectsSearchRequest.isTemporary ? filterToggleStatuses.TEMPORARY : filterToggleStatuses.DEFAULT;
        }

        if (props.projectsSearchRequest.isTemporaryClient) {
            return filterToggleStatuses.TEMPORARY_CLIENT;
        }

        if (props.projectsSearchRequest.isTemporarySite) {
            return filterToggleStatuses.TEMPORARY_SITE;
        }

        return 'All';
    };

    return (
        <>
            <div className="projects-top-container">
                <div className="action-btn-group">
                    <h2>{strings.COMMON.SORT_BY}</h2>
                    <CustomBtn name="Project Name" onClick={() => setSorterPerColumn('name')} type="search" />
                    <CustomBtn name="Project Number" onClick={() => setSorterPerColumn('number')} type="search" />
                    <CustomBtn name="Address" onClick={() => setSorterPerColumn('address')} type="search" />
                    <CustomBtn name="Manager" onClick={() => setSorterPerColumn('projectManager.fullName')} type="search" />
                    <CustomBtn name="Site" onClick={() => setSorterPerColumn('site.name')} type="search" />
                    <CustomBtn name="Status" onClick={() => setSorterPerColumn('isActive')} type="search" />
                    <SearchInput defaultValue={props.projectsSearchRequest.searchCriteria} searchInputRef={searchInputRef} placeholder="Custom Search" onChange={e => onSearch(e.target.value)} prefix={<SearchOutlined />} />
                    <TempProjectFilterButton selectedValue={getProjectStatusValue()} onChange={temporaryFilterChange} />
                    <CustomBtn className="cancel-btn" icon={<CloseCircleOutlined />} onClick={clearSortAndFilters} />
                </div>
                <CustomBtn icon={<FileAddOutlined />} onClick={onProjectAdd} type="primary" />
            </div>
            <div className="projects-layout" style={!isEmpty ? {} : { height: '87%' }}>
                {
                    !isEmpty ? (
                        <Table bordered
                            rowClassName="project-row"
                            key="id"
                            rowKey="id"
                            showSorterTooltip={false}
                            dataSource={props.paginatedProjects.data}
                            loading={isLoading}
                            columns={columns}
                            onChange={handleTableChange}
                            scroll={{ x: true }}
                            pagination={{
                                current: props.projectsSearchRequest.pageNumber,
                                pageSize: props.projectsSearchRequest.pageSize,
                                total: props.paginatedProjects.recordsCount,
                                pageSizeOptions: [10, 15, 100, 150, 200],
                                showSizeChanger: true
                            }}
                        />
                    ) : (
                        <div className="empty-projects-list-container">
                            <div className="add-new-project-actions-wrapper">
                                <span className="empty-projects-list-text">{strings.PROJECTS.EMPTY_PROJECTS_LIST_LABEL}</span>
                                <CustomBtn onClick={onProjectAdd} className="add-new-project-button" name={strings.PROJECTS.ADD_NEW_PROJECT_LABEL} type="default" icon={<FileAddOutlined />} />
                            </div>
                        </div>
                    )
                }
            </div>
            <BackTop />
        </>
    );
}

const mapState = ({ projects, authorizedLayout }) => {
    return {
        filteredSites: projects.filteredSites,
        isLoading: projects.isLoading,
        allSites: authorizedLayout.allSites,
        projectsSearchRequest: projects.projectsSearchRequest,
        paginatedProjects: projects.paginatedProjects
    };
}

const mapDispatch = (dispatch) => {
    return {
        setProjects(value) {
            dispatch(actions.setProjects(value));
        },
        setFilteredProjects(payload) {
            dispatch(actions.setFilteredProjects(payload));
        },
        setPageInfo(value) {
            dispatch(globalActions.setPageInfo(value));
        },
        clearEditable() {
            dispatch(actions.clearEditable());
        },
        setFilteredSites(values) {
            dispatch(actions.setFilteredSites(values));
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value))
        },
        setEditProjectId(id) {
            dispatch(actions.setEditProjectId(id));
        },
        setProjectSearchRequestStatus(value) {
            dispatch(actions.setProjectSearchRequestStatus(value));
        },
        setTemporaryClientStatus(value) {
            dispatch(actions.setTemporaryClientStatus(value));
        },
        setTemporarySiteStatus(value) {
            dispatch(actions.setTemporarySiteStatus(value));
        },
        setAllProjectSearchRequest() {
            dispatch(actions.setAllProjectSearchRequest());
        },
        setPaginatedProjects(value) {
            dispatch(actions.setPaginatedProjects(value));
        },
        setProjectsSearchRequestCriteria(value) {
            dispatch(actions.setProjectsSearchRequestCriteria(value));
        },
        setInitialProjectsSearchRequest() {
            dispatch(actions.setInitialProjectsSearchRequest());
        },
        setProjectsSearchRequestSorter(property, isAscend) {
            dispatch(actions.setProjectsSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setProjectsSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setProjectsSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        setPreparedFilteredSites(value) {
            dispatch(actions.setPreparedFilteredSites(value));
        }
    }
}

export default connect(mapState, mapDispatch)(ProjectsListPage);