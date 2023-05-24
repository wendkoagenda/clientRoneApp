import { actions as projectActions } from '../projects/projects-reducer'
import { connect } from 'react-redux';
import { SearchOutlined } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { strings } from '../../constants';
import { useDebouncedCallback } from 'use-debounce';
import { CustomBtn, SearchInput} from '../../components/common';
import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { 
     Spin,
     Table,
     notification
     } from 'antd';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { ProjectsService } from '../../services';
import ProjectBadge from './customer-portal-dnd/project-badge';

const ProjectsTable = (props) => {

    useEffect(() => {
        loadProjects();
    }, [loadProjects, props.projectsSearchRequest])

    const [ProjectsLoading, setProjectsLoading] = useState()
    const searchInputRef = useRef('');
    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const loadProjects = async () => {
        setProjectsLoading(true);
        try {
            const paginatedProjectResponse = await ProjectsService.searchByRequest(props.projectsSearchRequest);
            props.setPaginatedProjects(paginatedProjectResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setProjectsLoading(false);
    };


    const setSorterPerColumn = (columnName) => {
        props.setProjectsSearchRequestSorter(columnName, !props.projectsSearchRequest.isAscend);
    }

    const onSearch = useDebouncedCallback((searchString) => {
        props.setProjectsSearchRequestCriteria(searchString);
    }, 400);

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setProjectsSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const getSortOrderPerColumn = (columnName) => {
        return props.projectsSearchRequest.sortCriteria === columnName
            ? props.projectsSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }

    const clearSortAndFilters = () => {
        props.setInitialProjectsSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const renderProjectBadge = (item) => {
        return (
            <>
                <ProjectBadge item={item}
                    isSelected={props.customer?.projects.some(pr => pr.id == item.id)}
                />
            </>
        );
    };

    const columns = [{
        title: 'Projects',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        className: 'project-page-col',
        sorter: true,
        sortOrder: getSortOrderPerColumn('name'),
        render: (_, row) => {
            return (
                renderProjectBadge(row)
            );
        }
    },
    ]

    return (
        <div className="projects-section">
            <div className="projects-top-container">
                <h1>{strings.COMMON.SORT_BY}</h1>
                    <div className="action-btn-group">
                        <CustomBtn name="Project Name" onClick={() => setSorterPerColumn('name')} type="search" />
                        <CustomBtn name="Address" onClick={() => setSorterPerColumn('address')} type="search" />
                        <CustomBtn name="Manager" onClick={() => setSorterPerColumn('projectManager.fullName')} type="search" />
                    </div>
                    <div className="action-btn-group">
                        <CustomBtn name="Project Number" onClick={() => setSorterPerColumn('number')} type="search" />
                        <CustomBtn name="Site" onClick={() => setSorterPerColumn('site.name')} type="search" />
                        <CustomBtn name="Status" onClick={() => setSorterPerColumn('isActive')} type="search" />
                    </div>
                <div className="search-group">
                    <SearchInput defaultValue={props.projectsSearchRequest.searchCriteria} 
                                 searchInputRef={searchInputRef} placeholder="Custom Search" 
                                 onChange={e => onSearch(e.target.value)} 
                                 prefix={<SearchOutlined />} />
                    <CustomBtn className="cancel-btn" icon={<CloseCircleOutlined />} onClick={clearSortAndFilters} />
                </div>
            </div>
            {ProjectsLoading
                ? (
                    <div className="table-spinner">
                        <Spin indicator={loadingIcon} />
                    </div>
                )
                :
                <div className="projects-wrapper">
                    <Table
                        key="id"
                        size="small"
                        dataSource={props.paginatedProjects.data}
                        columns={columns}
                        onChange={handleTableChange}
                        showSorterTooltip={false}
                        pagination={{
                            current: props.projectsSearchRequest.pageNumber,
                            pageSize: props.projectsSearchRequest.pageSize,
                            total: props.paginatedProjects.recordsCount,
                            pageSizeOptions: [5, 10, 15],
                            showSizeChanger: true
                        }}
                    />
                </div>
            }
        </div>
    )
}

const mapState = ({ projects }) => {
    return {
        projectsSearchRequest: projects.projectsSearchRequest,
        paginatedProjects: projects.paginatedProjects
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPaginatedProjects(value) {
            dispatch(projectActions.setPaginatedProjects(value));
        },
        setProjectsSearchRequestCriteria(value) {
            dispatch(projectActions.setProjectsSearchRequestCriteria(value));
        },
        setInitialProjectsSearchRequest() {
            dispatch(projectActions.setInitialProjectsSearchRequest());
        },
        setProjectsSearchRequestSorter(property, isAscend) {
            dispatch(projectActions.setProjectsSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setProjectsSearchRequestPagination(pageSize, currentPage) {
            dispatch(projectActions.setProjectsSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
    }
}
export default connect(mapState, mapDispatch)(ProjectsTable);