import React, { useEffect, useState, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { SearchInput, CustomBtn, TextCropCell } from '../../components/common';
import { actions } from '../projects/projects-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { strings, sites, pageNumbers } from '../../constants';
import { CustomerPortalService } from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import {
    Table,
    notification,
    Radio,
    BackTop
} from 'antd';
import {
    SearchOutlined,
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

const AssignedProjects = (props) => {
    const {
        setPageInfo,
        paginatedProjects,
        changeLogoState,
        setPaginatedProjects,
        projectsSearchRequest
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const searchInputRef = useRef('');

    const clearSortAndFilters = () => {
        props.setInitialProjectsSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const onSearch = useDebouncedCallback((searchString) => {
        props.setProjectsSearchRequestCriteria(searchString);
    }, 400);

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
            <div className="info-col">
                {row.isActive
                    ? <TextCrop inputString="Active" title="Project Status" />
                    : <TextCrop inputString="Not active" title="Project Status" />
                }
            </div>
        )
    };

    const renderProjectTempStatus = (cell, row) => {
        return (
            <div className="status-switch">
                <div className="info-col">
                {row.isTemporary
                    ? <TextCrop inputString="Yes" title="Project Status" />
                    : <TextCrop inputString="No" title="Project Status" />
                }
            </div>
            </div>
        );
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

    const viewProject = (id) => {
        history.push(routes.GET_PROJECT_VIEW_PAGE(id))
    }

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('name'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                return (
                    <TextCropCell inputString={row.name} title="Project Name" />
                );
            }
        },
        {
            title: 'Project Number',
            dataIndex: 'number',
            key: 'number',
            width: '11%',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('number'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                return (
                    <TextCropCell inputString={row.number} title="Project Number" />
                );
            }
        },
        {
            title: 'Address',
            key: 'address',
            width: '15%',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('address'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                const addressString = [row.state, row.city, row.country, row.zipCode, row.address, row.addressLine].join(', ');
                return (
                    <TextCropCell icon={<HomeOutlined />} inputString={addressString} title="Address" />
                )
            }
        },
        {
            title: 'Business Party Assigned',
            dataIndex: 'clients',
            key: 'clients',
            width: '18%',
            className: 'project-page-col',
            sorter: true,
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                const clientsString = row.clients.map(item => item.company).join(', ');
                return (
                    <TextCropCell icon={<TeamOutlined />} inputString={clientsString} title="Business Parties" />
                )
            }
        },
        {
            title: 'Contact Assigned',
            dataIndex: 'contacts',
            key: 'contacts',
            width: '15%',
            className: 'project-page-col',
            sorter: true,
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                const contactsString = row.contacts.map(item => item.fullName).join(', ');
                return (
                    <TextCropCell icon={<TeamOutlined />} inputString={contactsString} title="Contacts" />
                )
            }
        },
        {
            title: 'Project Manager',
            dataIndex: 'projectManager',
            key: 'projectManager',
            width: '11%',
            className: 'project-page-col',
            sorter: true,
            sortOrder: getSortOrderPerColumn('projectManager.fullName'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: (_, row) => {
                return (
                    <TextCropCell icon={<UserOutlined />} inputString={row.projectManagerId ? row.projectManager.userName : null} title="Project Manager" />
                )
            }
        },
        {
            title: 'Site',
            dataIndex: 'site',
            key: 'site',
            width: '9%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('site.name'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: renderProjectSite,
            filterDropdown: (_) => (
                <FilterBySiteDropdown value={props.filteredSites} onChange={props.setPreparedFilteredSites} submit={onSiteSearchSubmitted} />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            fixed: 'right',
            width: '6%',
            sorter: true,
            sortOrder: getSortOrderPerColumn('isActive'),
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: renderProjectStatus
        },
        {
            title: 'Temporary',
            dataIndex: 'isTemporary',
            key: 'isTemporary',
            fixed: 'right',
            width: '6%',
            onCell:(row) => {
                return {
                    onClick:() => viewProject(row.id)
                }
            },
            render: renderProjectTempStatus
        },
    ];

    const loadProjects = useCallback(async () => {
        setIsLoading(true);

        try {
            const paginatedProjectResponse = await CustomerPortalService.getAssignedProjects(projectsSearchRequest);
            setPaginatedProjects(paginatedProjectResponse.data.data);
            console.log(paginatedProjectResponse.data.data)
            setIsLoading(false);
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

    const isEmpty = props.paginatedProjects.data.length === 0 && !props.projectsSearchRequest.isFiltered;

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
                                pageSizeOptions: [10, 15, 20],
                                showSizeChanger: true
                            }}
                        />
                    ) : (
                        <div className="empty-projects-list-container">
                            <div className="add-new-project-actions-wrapper">
                                <span className="empty-projects-list-text">{strings.PROJECTS.EMPTY_PROJECTS_LIST_LABEL}</span>
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

export default connect(mapState, mapDispatch)(AssignedProjects);