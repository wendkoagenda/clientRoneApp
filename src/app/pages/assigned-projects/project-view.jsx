import React, { useEffect } from 'react';
import {
    notification,
    Row,
    Col,
} from 'antd';
import { actions } from '../projects/projects-reducer'
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { strings} from '../../constants';
import { connect } from 'react-redux';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { CustomerPortalService } from '../../services';
import { useParams } from 'react-router';
import { CustomBtn, CustomInput } from '../../components/common';
import routes from '../routes';
import { FileTextOutlined } from '@ant-design/icons';
import history from '../../history';

const ProjectViewPage = (props) => {
    const { projectId } = useParams();

    const getProjectById = async (projectId) => {
        try {
            const response = await CustomerPortalService.getProjectById(projectId);
            if (response && response.data && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_FETCH_PROJECT_DATA);
            notification['error']({
                message: errorMessage,
            });

            return null;
        }
    };

    useEffect(() => {
        props.setPageInfo(strings.PAGES.PROJECT_DETAILS, null)
        getProjectById(projectId).then((project) => {
            props.setProjectValues(project)
        })
    }, []);

    const renderClientItem = (client) => {
        return (
            <div className="client-item">
                {client.id == props.project?.primaryClientId && (
                    <Row justify="space-between">

                        <Col className="property-col">
                            <CustomInput
                                value={strings.PROJECTS.PRIMARY_CLIENT}
                                type="text"
                                disabled={true}
                            />
                        </Col>
                    </Row>
                )}
                <Row justify="space-between">
                    <Col className="property-col">
                        <CustomInput
                            value={client.company}
                            placeHolder={strings.INVOICE.LABELS.CLIENT}
                            type="text"
                            disabled={true}
                        />
                    </Col>
                    <Col className="property-col">
                        <CustomInput
                            value={client.address}
                            placeHolder={strings.COMMON.ADDRESS}
                            type="text"
                            disabled={true}
                        />
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col className="property-col">
                        <CustomInput
                            value={client.city}
                            placeHolder={strings.COMMON.CITY}
                            type="text"
                            disabled={true}
                        />
                    </Col>
                    <Col className="property-col">
                        <CustomInput
                            value={client.officeNumber}
                            placeHolder={strings.COMMON.OFFICE_NUMBER}
                            type="text"
                            disabled={true}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
    const renderContactItem = (contact) => {
        return <div className="contact-item">
            <Row justify="space-between">
                <Col className="property-col">
                    <CustomInput
                        value={contact.fullName}
                        placeHolder={strings.COMMON.CONTACT_NAME}
                        type="text"
                        disabled={true}
                    />
                </Col>
                <Col className="property-col">
                    <CustomInput
                        value={contact.address}
                        placeHolder={strings.COMMON.ADDRESS}
                        type="text"
                        disabled={true}
                    />
                </Col>
            </Row>
            <Row justify="space-between">
                <Col className="property-col">
                    <CustomInput
                        value={contact.city}
                        placeHolder={strings.COMMON.CITY}
                        type="text"
                        disabled={true}
                    />
                </Col>
                <Col className="property-col">
                    <CustomInput
                        value={contact.email}
                        placeHolder={strings.COMMON.EMAIL}
                        type="text"
                        disabled={true}
                    />
                </Col>
            </Row>
            <Row justify="space-between">
                <Col className="property-col">
                    <CustomInput
                        value={contact.contactNumberOffice}
                        placeHolder={strings.COMMON.CONTACT_NUMBER_OFFICE}
                        type="text"
                        disabled={true}
                    />
                </Col>
                <Col className="property-col">
                    <CustomInput
                        value={contact.contactNumberCell}
                        placeHolder={strings.COMMON.CONTACT_NUMBER_CELL}
                        type="text"
                        disabled={true}
                    />
                </Col>
            </Row>
            <Row justify="space-between">
                <Col className="property-col">
                    <CustomInput
                        value={contact.isPaymentsResponsible ? "Yes" : "No"}
                        placeHolder={strings.PROJECTS.PAYMENTS_RESPONSIBLE}
                        type="text"
                        disabled={true}
                    />
                </Col>
                <Col className="property-col">
                    <CustomInput
                        value={contact.zipCode}
                        placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ZIP}
                        type="text"
                        disabled={true}
                    />
                </Col>
            </Row>            
        </div>
    }
    return (
            <div className="project-view-layout">
                <div className="project-container">
                        <Row className="project-details-title" justify='space-between'>
                            <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.PROJECT_DETAILS}</span>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.id}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.NUMBER}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.name}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.NAME}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.budget ? props.project?.budget : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.BUDGET}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.address ? props.project?.address : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ADDRESS}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.addressLine ? props.project?.addressLine : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ADDRESS_LINE}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.city ? props.project?.city : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CITY}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.zipCode ? props.project?.zipCode : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ZIP}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.state ? props.project?.state : "N/A"}
                                    placeHolder={strings.COMMON.STATE}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.projectManager ? props.project?.projectManager.fullName : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.PROJECT_MANAGER_LOWERCASE}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.site ? props.project?.site.name : "N/A"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.SITE}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.isActive ? "Yes" : "No"}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.IS_ACTIVE}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                            <Col className="property-col">
                                <CustomInput
                                    value={props.project?.isTemporary ? "Yes" : "No" }
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.IS_TEMPORARY}
                                    type="text"
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                        {props.project.clients.length > 0 &&
                            <React.Fragment>
                                <div className="client-details-title">
                                    <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CLIENT_DETAILS}</span>
                                </div>
                                <Row>
                                    <Col span={24}>
                                        {props.project.clients.map(item => renderClientItem(item))}
                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                        {props.project.contacts.length > 0 &&
                            <React.Fragment>
                                <div className="contact-details-title">
                                    <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CONTACT_DETAILS}</span>
                                </div>
                                <Row>
                                    <Col span={24}>
                                        {props.project.contacts.map(item => renderContactItem(item))}
                                    </Col>
                                </Row>
                            </React.Fragment>
                        }
                        <Row justify='end'>
                            <Col>
                                <CustomBtn 
                                    icon={<FileTextOutlined style={{ fontSize: '22px', marginRight: '-3px' }} />} 
                                    type="default" 
                                    name={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.REPORTS} 
                                    onClick={ _ => history.push(routes.GET_REPORT_LIST_BY_CUSTOMER_BY_PROJECT_ROUTE(projectId))} />
                            </Col>
                        </Row>
                </div>
            </div>
    );
};

const mapState = ({ projects }) => {
    return {
        project: projects.project,
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setProjectValues(values) {
            dispatch(actions.setProjectValues(values));
        },
    }
}

export default connect(mapState, mapDispatch)(ProjectViewPage);