import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { CustomerPortalService, ProjectsService} from '../../services';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import {strings} from '../../constants';
import {
    Col,
    Popconfirm,
    notification, Row
} from 'antd';
import { CustomBtn, CustomInput } from '../../components/common';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import ProjectsDropArea from './customer-portal-dnd/projects-drop-area';
import { actions as projectActions} from '../projects/projects-reducer'
import { actions as customerActions} from './customer-portal-reducer'
import ProjectsTable from './projects-table'


const ManageUserProjects = (props) => {
    const { userId } = useParams();

    useEffect(() => {
       props.setCustomer(null);
       loadCustomer();
       loadProjects();
    }, [])  

    const loadProjects = async () => {
        try {
            const projects = await ProjectsService.getProjects();
            props.setProjects(projects.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const loadCustomer = async () => {
        try {
            const user = await CustomerPortalService.searchById(userId)
            props.setCustomer(user.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_CUSTOMERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const onProjectAssigned = (project) => {
        props.assignProject(project)
    }

    const onProjectRemoved = (project) =>{
        props.removeProject(project)
    }

    const handleSubmit = async _ => {
        try {
            const model = {
                customerId: props.customer.id.toString(),
                projectsIds: props.customer.projects.map(p => p.id)
            }
            await CustomerPortalService.assignProjects(model);

            notification['success']({
                message: strings.CUSTOMER_PORTAL.CUSTOMER_PROJECTS_UPDATED
            });
            history.back();
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.UPDATE_CUSTOMER_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    return(
        <DndProvider backend={HTML5Backend}>
            <div className="user-manage-projects-layout">
                <ProjectsTable customer={props.customer}/>
                <div className="user-info-section">
                    <div className="user-info">
                        <Row className="title-row">
                            <h1>CUSTOMER DETAILS</h1>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.customer?.id}
                                    placeHolder={strings.USER_PROPERTIES.ID}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.customer?.userName}
                                    placeHolder={strings.USER_PROPERTIES.NAME}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>  
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.customer?.phoneNumber ? props.customer?.phoneNumber : "N/A"}
                                    placeHolder={strings.USER_PROPERTIES.PHONE_NUMBER}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.customer?.fullName}
                                    placeHolder={strings.USER_PROPERTIES.FULL_NAME}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row> 
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.customer?.email ? props.customer?.email : "N/A"}
                                    placeHolder={strings.USER_PROPERTIES.MAIL}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>                      
                    </div>
                    <Row className="projects-title">
                    <h1>PROJECTS DETAILS</h1>
                        </Row>
                  
                    <Col span={24}>
                                <ProjectsDropArea onDrop={onProjectAssigned} 
                                                  onRemove={onProjectRemoved} 
                                                  projects={props.customer?.projects}
                                                  user={props.customer}
                                />
                    </Col>
                    <div className="actions-section">
                        <Popconfirm
                            placement="top"
                            title={strings.CUSTOMER_PORTAL.ARE_YOU_SURE}
                            onConfirm={handleSubmit}
                            okText={strings.COMMON.OK}
                            cancelText={strings.COMMON.CANCEL}
                        >
                            <CustomBtn type="primary" name={strings.CUSTOMER_PORTAL.SAVE_CHANGES} />
                        </Popconfirm>
                    </div>
                </div>
            </div>
        </DndProvider>
    )
}

const mapState = ({customer}) => {
    return {
        customer: customer.customer,
        projects: customer.projects,
        assignedProjects: customer.assignedProjects,
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value));
        },
        assignProject(value) {
            dispatch(customerActions.assignProject(value));
        },
        removeProject(value) {
            dispatch(customerActions.removeProject(value));
        },
        setAssignedProjects(value) {
            dispatch(customerActions.setAssignedProjects(value));
        },
        setProjects(value) {
            dispatch(customerActions.setProjects(value));
        },
        setCustomer(value) {
            dispatch(customerActions.setCustomer(value));
        },
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

export default connect(mapState, mapDispatch)(ManageUserProjects);


