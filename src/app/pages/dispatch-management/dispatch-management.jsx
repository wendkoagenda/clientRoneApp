import React, { useEffect, useState } from 'react';
import {
    Form,
    notification,
    List,
    Row,
    Col,
    Button,
    Tabs,
    Spin,
    Popconfirm,
    Tooltip,
    Collapse,
    Input,
    Switch
} from 'antd';
import history from '../../history';
import routes from '../routes';
import { SearchOutlined, LoadingOutlined, CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { actions } from './dispatch-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { CustomInput, SearchInput, CustomBtn, CustomSingleOptionSelect, CustomMaskedInput } from '../../components/common';
import { strings, sites, pageNumbers } from '../../constants';
import { connect } from 'react-redux';
import { rules, emailRule, maskedPhoneNumberRule, projectNumberRule, zipCodeRule } from '../../helpers/validation-rules';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { DispatchService, ClientsService, StatesService, ProjectsService } from '../../services';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WorkOrderDropArea from './dispatch-dnd/work-order-drop-area';
import SubWorkOrderBadge from './dispatch-dnd/sub-work-order-badge';
import { useDebouncedCallback } from 'use-debounce';
import ProjectBadge from './dispatch-dnd/project-badge';
import ClientBadge from '../projects/projects-dnd/client-badge';
import ProjectDropArea from './dispatch-dnd/project-drop-area';
import ClientDropArea from './dispatch-dnd/client-drop-area';
import { getOnlyNumbers } from '../../helpers/text.helper';
import { searchWorkOrders } from '../../helpers/search-helper';
import UpsertTestModal from './dispatch-dnd/upsert-test-modal';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

const spinnerStyle = {
    position: 'absolute',
    top: '50%',
    left: '61%'
}

const clientSiteSelectOptions = [
    {
        key: "Rone",
        value: "Rone"
    },
    {
        key: "JRB",
        value: "JRB"
    }
];

const PROJECT_FORM_CLASS_NAME = 'project-form-block';
const PROJECT_FORM_IN_CLASS_NAME = 'project-block-in';
const PROJECT_FORM_OUT_CLASS_NAME = 'project-block-out';

const CLIENT_FORM_CLASS_NAME = 'client-form-block';
const CLIENT_FORM_IN_CLASS_NAME = 'client-block-in';
const CLIENT_FORM_OUT_CLASS_NAME = 'client-block-out';

const CONTACT_FORM_CLASS_NAME = 'contact-form-block';
const CONTACT_EXPANDED_FORM_IN_CLASS_NAME = 'contact-expanded-block-in';
const CONTACT_EXPANDED_FORM_OUT_CLASS_NAME = 'contact-expanded-block-out';
const CONTACT_DEFAULT_FORM_IN_CLASS_NAME = 'contact-default-block-in';
const CONTACT_DEFAULT_FROM_OUT_CLASS_NAME = 'contact-default-block-out';

const DispatchManagementPage = (props) => {
    const [projectForm] = Form.useForm();
    const [clientForm] = Form.useForm();
    const [dispatchForm] = Form.useForm();
    const [dispatchContactForm] = Form.useForm();
    const [projectFormClassName, setProjectFormClassName] = useState(PROJECT_FORM_CLASS_NAME);
    const [clientFormClassName, setClientFormClassName] = useState(`${CLIENT_FORM_CLASS_NAME} ${CLIENT_FORM_OUT_CLASS_NAME}`);
    const [contactFormClassName, setContactFormClassName] = useState(CONTACT_FORM_CLASS_NAME);
    const [currentTabKey, setCurrentTabKey] = useState('1');
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [isClientsLoading, setIsClientsLoading] = useState(false);
    const [isProjectDisabled, setProjectDisabled] = useState(false);
    const [isClientDisabled, setClientDisabled] = useState(false);
    const [isProjectAssigning, setProjectAssigning] = useState(false);
    const [isProjectHidden, setProjectHidden] = useState(false);
    const [isClientHidden, setClientHidden] = useState(true);
    const [isContactHidden, setIsContactHidden] = useState(false);
    const [isContactFormDisplayed, setIsContactFormDisplayed] = useState(false);
    const [isTemporaryClient, setIsTemporaryClient] = useState(false);
    const [isTestsModalVisible, setTestsModalVisible] = useState(false);
    const [testsWorkOrderId, setTestsWorkOrderId] = useState();

    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const dispatchManagementInitial = async () => {
        props.setPageInfo(props.editingStatus ? strings.PAGES.DISPATCH_MANAGEMENT.EDIT : strings.PAGES.DISPATCH_MANAGEMENT.ADD, pageNumbers.DISPATCH);

        await refreshSearchableData();
        await loadWorkOrders();
        setCurrentTabKey('1');
        projectForm.resetFields();
        clientForm.resetFields();
        dispatchForm.resetFields();
        dispatchContactForm.resetFields();

        if (!props.states.length) {
            try {
                const { data } = await StatesService.getAll();
                if (data && data.data && data.data.length) {
                    props.setStates(data.data);
                }
            } catch (error) {
                TrackingService.trackException(error);
                const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_STATES_ERROR);
                notification['error']({
                    message: errorMessage,
                });
            }
        }

        if (props.editingStatus) {
            setProjectAssigning(true);

            projectForm.setFieldsValue({ ...props.editingDispatch.project, projectName: props.editingDispatch.project.name });
            props.setAssignedItem('assignedProject', props.editingDispatch.project);

            clientForm.setFieldsValue({ ...props.editingDispatch.client });
            props.setAssignedItem('assignedClient', { ...props.editingDispatch.client });

            dispatchForm.setFieldsValue({ contactId: props.editingDispatch.contactId, notes: props.editingDispatch.notes });

            props.assignWorkOrders(props.editingDispatch.workOrders);

            setProjectDisabled(true);
            setClientDisabled(true);
            setProjectAssigning(false);

            if (props.editingDispatch.client.isTemporaryClient) {
                handleTempClient();
            }

            if (props.editingDispatch.project.site.name.includes(sites.JRB)) {
                props.changeLogoState(false);
            }
            else {
                props.changeLogoState(true);
            }
        }
    }

    useEffect(() => {
        props.setGlobalSpinState(true);
        dispatchManagementInitial().then(() => {
            props.setGlobalSpinState(false);
        })

        return () => {
            props.setFilteredWorkOrders(null);
        }
    }, [])

    const handleSubmit = async () => {
        let newDispatchModel = {};

        if (props.assignedItems.assignedProject && props.assignedItems.assignedProject.id) {
            newDispatchModel.projectId = props.assignedItems.assignedProject.id;
        }
        else {
            const validateProject = await projectForm.validateFields();
            newDispatchModel.project = { ...validateProject };
            newDispatchModel.project.country = 'USA';
            newDispatchModel.project.site = props.allSites.find(item => item.id == newDispatchModel.project.siteId);
        }

        if (isTemporaryClient) {
            newDispatchModel.isTemporaryClient = isTemporaryClient
        }
        else if (props.assignedItems.assignedClient && props.assignedItems.assignedClient.id) {
            newDispatchModel.clientId = props.assignedItems.assignedClient.id;
        }
        else {
            const validateClient = await clientForm.validateFields();
            newDispatchModel.client = { ...validateClient};
            newDispatchModel.client.country = 'USA';
        }

        if (props.managedDispatch.workOrders && props.managedDispatch.workOrders.length) {
            newDispatchModel.workOrderIds = props.managedDispatch.workOrders.map(item => item.id);
            newDispatchModel.workOrders = props.managedDispatch.workOrders.map(item => {
                return {
                    id: item.id,
                    startDate: item.startDate.toUTCKind().format(),
                    endDate: item.endDate.toUTCKind().format(),
                    parentWorkOrderId: item.parentWorkOrderId,
                    isFullTimeWorkOrder: item.isFullTimeWorkOrder,
                    notes: item.notes,
                    dispatchRequestWorkOrderConcreteTests: (item.dispatchRequestWorkOrderConcreteTests && item.dispatchRequestWorkOrderConcreteTests.length)
                        ? item.dispatchRequestWorkOrderConcreteTests
                        : [],
                    dispatchRequestWorkOrderSoilTests: (item.dispatchRequestWorkOrderSoilTests && item.dispatchRequestWorkOrderSoilTests.length)
                        ? item.dispatchRequestWorkOrderSoilTests
                        : []
                }
            });
        }

        if (newDispatchModel.client && newDispatchModel.client.officeNumber) {
            newDispatchModel.client.officeNumber = getOnlyNumbers(newDispatchModel.client.officeNumber);
        }

        const dispatchDefaultForm = await dispatchForm.validateFields();

        newDispatchModel.notes = dispatchDefaultForm.notes;

        if (isContactFormDisplayed) {
            const dispatchContact = await dispatchContactForm.validateFields();

            newDispatchModel.contactId = 0;

            newDispatchModel.contact = {
                ...dispatchContact,
                contactNumberCell: getOnlyNumbers(dispatchContact.contactNumberCell)
            }
        } else {
            newDispatchModel.contactId = dispatchDefaultForm.contactId;
        }

        try {
            if (props.editingStatus) {
                newDispatchModel.id = props.editingDispatch.id;

                await DispatchService.editDispatchRequest(newDispatchModel);
            } else {
                await DispatchService.createDispatchRequest(newDispatchModel);
            }

            notification['success']({
                message: props.editingStatus ? strings.COMMON.DISPATCH_UPDATED : strings.COMMON.DISPATCH_CREATED,
            });
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, props.editingStatus ? strings.COMMON.DISPATCH_EDIT_ERROR : strings.COMMON.DISPATCH_CREATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        projectForm.resetFields();
        clientForm.resetFields();

        history.push(routes.WORK_ORDERS);
    };

    const loadWorkOrders = async () => {
        setIsOrdersLoading(true);

        try {
            const workOrders = await DispatchService.getAllWorkOrder();

            props.setWorkOrders(workOrders.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_CLIENTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsOrdersLoading(false);
    };

    const renderWorkOrderBadge = () => {
        const records = props.filteredWorkOrders !== null ? props.filteredWorkOrders : props.workOrders;

        return (
            <Collapse>
                {records &&
                    Object.keys(records).map((key) => {
                        return (
                            <Panel header={key} key={key}>
                                <List key="id"
                                    className="employees-list"
                                    size="small"
                                    dataSource={records[key]}
                                    renderItem={swo => <SubWorkOrderBadge item={swo} workType={key} isSelected={!!props.managedDispatch.workOrders && props.managedDispatch.workOrders.some(subwo => subwo.id == swo.id)} />}
                                />
                            </Panel>
                        )
                    })
                }
            </Collapse>
        );
    };

    const onWorkOrderAssigned = (item) => {
        props.assignWorkOrder(item.workType, item.workOrderId);
    };

    const onWorkOrderRemoved = (id) => {
        props.unassignWorkOrder(id);
    };

    const onDateRangeChanged = (id, dates) => {
        props.setWorkOrderDateRange(id, dates);
    };

    const handleFullTime = (id, value) => {
        props.setFullTimeWorkOrder(id, value);
    };

    const handleProjectFieldsChange = useDebouncedCallback(async (changedFields, allFields, isInitial) => {
        setIsProjectsLoading(true);
        setCurrentTabKey(isInitial ? '1' : '2');

        try {
            const projectSearchResponse = await ProjectsService.searchProjects({ ...props.projectSearchCriteria, [changedFields[0].name[0]]: changedFields[0].value });
            props.setFilteredProjects(projectSearchResponse.data.data);

            setIsProjectsLoading(false);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsProjectsLoading(false);
        }

        props.changeProjectSearchCriteria(changedFields[0].name[0], changedFields[0].value);
    }, 500);

    const handleClientFieldsChange = useDebouncedCallback(async (changedFields, allFields, isInitial) => {
        setIsClientsLoading(true);
        setCurrentTabKey(isInitial ? '1' : '3');

        try {
            const propertyValue = changedFields[0].name[0] === "officeNumber" ? getOnlyNumbers(changedFields[0].value) : changedFields[0].value;

            const clientsSearchResponse = await ClientsService.searchClients({ ...props.clientSearchCriteria, [changedFields[0].name[0]]: propertyValue });
            props.setFilteredClients(clientsSearchResponse.data.data);

            setIsClientsLoading(false);
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_CLIENTS_ERROR);
            notification['error']({
                message: errorMessage,
            });

            setIsClientsLoading(false);
        }

        props.changeClientSearchCriteria(changedFields[0].name[0], changedFields[0].value);
    }, 500);

    const refreshSearchableData = async () => {
        props.setInitialSearchCriterias();
        await handleProjectFieldsChange([{ name: '', value: '' }], null, true);
        await handleClientFieldsChange([{ name: '', value: '' }], null, true);
    };

    const refreshProjectsData = async () => {
        props.setInitialSearchCriterias();
        await handleProjectFieldsChange([{ name: '', value: '' }], null, false);
    };

    const refreshClientsData = async () => {
        props.setInitialSearchCriterias();
        await handleClientFieldsChange([{ name: '', value: '' }], null, false);
    };

    const renderProjectBadge = (item) => {
        return (
            <ProjectBadge item={item}
                isSelected={props.assignedItems.assignedProject.id == item.id}
                filteredItems={props.filteredProjects}
                filteredClients={props.filteredClients}
            />
        );
    };

    const renderClientBadge = (item) => {
        return (
            <ClientBadge item={item}
                isSelected={props.assignedItems.assignedClient?.id == item.id}
                isHiddenAction={true}
                filteredItems={props.filteredClients}
            />
        );
    };

    const projectOnDrop = async (item) => {
        setProjectAssigning(true);
        if (!isTemporaryClient) {
            setClientFormClassName(`${CLIENT_FORM_CLASS_NAME} ${CLIENT_FORM_OUT_CLASS_NAME}`);
            setContactFormClassName(`${CONTACT_FORM_CLASS_NAME} ${CONTACT_DEFAULT_FROM_OUT_CLASS_NAME}`);
            setClientHidden(true);
            setIsContactHidden(true);
        }

        const project = item.filteredProjects.find(pr => pr.id == item.projectId);

        projectForm.setFieldsValue({ ...project, projectName: project.name });

        props.setAssignedItem('assignedProject', project);

        try {
            const projectResponse = await ProjectsService.getProjectById(project.id);
            if (projectResponse.data.data.clients.length) {
                const primaryClient = projectResponse.data.data.clients.find(item => item.isPrimary);

                if (primaryClient.isTemporaryClient) {
                    handleTempClient();
                } else {
                    setIsTemporaryClient(false);
                }

                await clientOnDrop({ clientId: primaryClient.id, filteredClients: [primaryClient] });
                props.setFilteredClients(projectResponse.data.data.clients);
            } else {
                handleClientUnassign();
            }
        }
        catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_PROJECTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
            setProjectAssigning(false);
        }
        setProjectDisabled(true);
        setProjectAssigning(false);

        await refreshProjectsData();
    }

    const clientOnDrop = async (item) => {
        const client = item.filteredClients.find(cl => cl.id == item.clientId);

        clientForm.setFieldsValue(client);

        props.setAssignedItem('assignedClient', client);
        dispatchForm.setFieldsValue({ contactId: undefined });

        setClientDisabled(true);
    }

    const handleProjectUnassign = async () => {
        projectForm.resetFields();

        props.setAssignedItem('assignedProject', {});

        handleClientUnassign();
        setProjectDisabled(false);

        await refreshClientsData();
        await refreshProjectsData();
    }

    const handleClientUnassign = () => {
        clientForm.resetFields();
        dispatchForm.setFieldsValue({ contactId: undefined });

        props.setAssignedItem('assignedClient', {});

        setClientDisabled(false);

        if (isTemporaryClient) {
            handleTempClient();
        }
    }

    const handleTempClient = () => {
        if (!isTemporaryClient) {
            setClientFormClassName(`${CLIENT_FORM_CLASS_NAME} ${CLIENT_FORM_OUT_CLASS_NAME}`);
            setContactFormClassName(`${CONTACT_FORM_CLASS_NAME} ${CONTACT_DEFAULT_FROM_OUT_CLASS_NAME}`);
            clientForm.resetFields();
            dispatchContactForm.resetFields();
            projectForm.resetFields(['number']);
            if (isClientDisabled) {
                handleClientUnassign()
            };
        };
        if (isTemporaryClient) {
            setClientHidden(true);
            setIsContactHidden(true);
        }
        setIsTemporaryClient(!isTemporaryClient)
        projectForm.validateFields(['number', 'siteId'])
    }

    const sitesSelectOptions = (props.user.sites && props.allSites.length) && props.user.sites.map(siteId => {
        return {
            key: siteId,
            value: siteId,
            displayValue: props.allSites.find(item => item.id == siteId)?.name,
        };
    });

    const stateSelectOptions = props.states.map(state => {
        return {
            key: state.id,
            value: state.name
        };
    });

    const contactDetailsSelectOptions = () => {
        let options = (props.assignedItems && props.assignedItems.assignedClient && props.assignedItems.assignedClient.contacts && props.assignedItems.assignedClient.contacts.length)
            ? props.assignedItems.assignedClient.contacts.map(item => {
                return {
                    key: item.id,
                    value: item.id,
                    displayValue: `${item.fullName} (${item.email}, Office - ${item.contactNumberOffice}, Cell - ${item.contactNumberCell})`
                };
            })
            : [];

        if (props.assignedItems.assignedClient && props.assignedItems.assignedClient.id) {
            options = [{
                key: 0,
                value: 0,
                displayValue: "Create new contact"
            }, ...options]
        }

        return options;
    }

    const onWorkOrderSearch = (searchString) => {
        if (searchString == "") {
            props.setFilteredWorkOrders(null);
        }

        props.setFilteredWorkOrders(searchWorkOrders(searchString, props.workOrders));
    };

    const handleVisibility = (formClassName, setFormClassName, hiddenProperty, setHiddenProperty) => {
        if (hiddenProperty) {
            if (formClassName == PROJECT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${PROJECT_FORM_IN_CLASS_NAME}`);
            }

            if (formClassName == CLIENT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${CLIENT_FORM_IN_CLASS_NAME}`);
            }

            if (formClassName == CONTACT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${isContactFormDisplayed ? CONTACT_EXPANDED_FORM_IN_CLASS_NAME : CONTACT_DEFAULT_FORM_IN_CLASS_NAME}`);
            }
        } else {
            if (formClassName == PROJECT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${PROJECT_FORM_OUT_CLASS_NAME}`);
            }

            if (formClassName == CLIENT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${CLIENT_FORM_OUT_CLASS_NAME}`);
            }

            if (formClassName == CONTACT_FORM_CLASS_NAME) {
                setFormClassName(`${formClassName} ${isContactFormDisplayed ? CONTACT_EXPANDED_FORM_OUT_CLASS_NAME : CONTACT_DEFAULT_FROM_OUT_CLASS_NAME}`);
            }
        }
        setHiddenProperty(prev => !prev);
    };

    const handleCreateContactForm = (value) => {
        setIsContactFormDisplayed(value === 0);
        if (value === 0) {
            setContactFormClassName(prev => {
                return `${prev} contact-expanded-block`;
            });
        } else {
            setContactFormClassName(prev => {
                return `${prev} contact-default-block`;
            });
        }
    };

    const handleTestsModalOpen = (id) => {
        setTestsModalVisible(true);
        setTestsWorkOrderId(id);
    };

    const createPickupRequest = (id) => {
        const selectedWorkOrder = props.managedDispatch.workOrders.find(item => item.id == id);
        if (props.managedDispatch.workOrders.some(item => item.parentWorkOrderId == selectedWorkOrder.id || item.parentWorkOrderId == selectedWorkOrder.dispatchRequestWorkOrderId)) {
            notification['error']({
                message: strings.DISPATCH.ERROR_NOTIFICATIONS.UNABLE_TO_CREATE_PICKUP_REQUEST
            });
        } else {
            props.createPickupRequest(id);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="project-manage-layout">
                <div className="project-clients-container">
                    <Tabs defaultActiveKey="1" activeKey={currentTabKey} onTabClick={(key) => setCurrentTabKey(key)} size='large'>
                        <TabPane tab={strings.DISPATCH.LABELS.WORK_ORDERS} key="1">
                            <div className="tab-wrapper">
                                {isOrdersLoading
                                    ? (
                                        <div className="table-spinner">
                                            <Spin indicator={loadingIcon} />
                                        </div>
                                    ) : (
                                        <>
                                            <SearchInput
                                                style={{ marginBottom: '15px' }}
                                                placeholder={strings.DISPATCH.LABELS.SEARCH_WORK_ORDERS}
                                                value={props.searchString}
                                                onChange={e => onWorkOrderSearch(e.target.value)}
                                                prefix={<SearchOutlined />} />
                                            {
                                                renderWorkOrderBadge()
                                            }
                                        </>
                                    )
                                }
                            </div>
                        </TabPane>
                        <TabPane tab={strings.DISPATCH.LABELS.PROJECTS} key="2">
                            <div className="tab-wrapper">
                                {isProjectsLoading
                                    ? (
                                        <div className="table-spinner">
                                            <Spin indicator={loadingIcon} />
                                        </div>
                                    )
                                    : (
                                        <List key="id" size="small" dataSource={props.filteredProjects} renderItem={renderProjectBadge} />
                                    )
                                }
                            </div>
                        </TabPane>
                        <TabPane tab={strings.DISPATCH.LABELS.CLIENTS} key="3">
                            <div className="tab-wrapper">
                                {isClientsLoading
                                    ? (
                                        <div className="table-spinner">
                                            <Spin indicator={loadingIcon} />
                                        </div>
                                    )
                                    : (
                                        <List key="id" size="small" dataSource={props.filteredClients} renderItem={renderClientBadge} />
                                    )
                                }
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
                <div className="project-form-container">
                    <div className="profile-management-title">
                        <span>{strings.DISPATCH.LABELS.PROJECT_DETAILS}</span>
                        {isProjectHidden
                            ? <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => handleVisibility(PROJECT_FORM_CLASS_NAME, setProjectFormClassName, isProjectHidden, setProjectHidden)} icon={<DownOutlined />} />
                            : <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => { handleVisibility(PROJECT_FORM_CLASS_NAME, setProjectFormClassName, isProjectHidden, setProjectHidden); setCurrentTabKey('1') }} icon={<UpOutlined />} />
                        }
                    </div>
                    {isProjectAssigning && <Spin style={spinnerStyle} indicator={loadingIcon} />}
                    {isProjectDisabled &&
                        <Tooltip title={strings.COMMON.UNASSIGN}>
                            <Popconfirm
                                placement="top"
                                title={strings.COMMON.UNASSIGN_BUTTON_CONFIRM}
                                onConfirm={handleProjectUnassign}
                                okText={strings.COMMON.OK}
                                cancelText={strings.COMMON.CANCEL}
                            >
                                <Button className="unassign-btn" style={{ marginLeft: '100%' }} icon={<CloseOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    }
                    <div style={isProjectAssigning ? { opacity: '0.4' } : { opacity: '1' }}>
                        <ProjectDropArea onDrop={projectOnDrop} className={projectFormClassName}>
                            <Form form={projectForm} name="project-form" onFieldsChange={handleProjectFieldsChange}>
                                <Row>
                                    <Col span={11}>
                                        <CustomInput name="name" disabled={isProjectDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.PROJECT_NAME} />
                                    </Col>
                                    <Col span={11} offset={2}>
                                        <CustomInput name="number" type="number" disabled={(isProjectDisabled || isTemporaryClient)} rules={!isTemporaryClient ? [{ validator: projectNumberRule }] : [{}]} placeHolder={strings.DISPATCH.LABELS.PROJECT_NUMBER} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={11}>
                                        <CustomSingleOptionSelect disabled={isProjectDisabled} placeholder={strings.COMMON.SITE} name="siteId" options={sitesSelectOptions} rules={!isTemporaryClient && rules} />
                                    </Col>
                                    <Col span={11} offset={2}>
                                        <CustomInput name="address" disabled={isProjectDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.ADDRESS} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={11}>
                                        <CustomInput name="addressLine" disabled={isProjectDisabled} placeHolder={strings.DISPATCH.LABELS.ADDRESS_LINE} />
                                    </Col>
                                    <Col span={11} offset={2}>
                                        <CustomInput name="city" disabled={isProjectDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.CITY} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={11}>
                                        <CustomSingleOptionSelect disabled={isProjectDisabled} placeholder={strings.COMMON.STATE} name="state" options={stateSelectOptions} rules={rules} />
                                    </Col>
                                    <Col span={11} offset={2}>
                                        <CustomInput name="zipCode" disabled={isProjectDisabled} rules={zipCodeRule} placeHolder={strings.DISPATCH.LABELS.ZIP} />
                                    </Col>
                                </Row>
                            </Form>
                        </ProjectDropArea>
                        <div className="profile-management-title">
                            <span>{strings.DISPATCH.LABELS.WORK_ORDER}</span>
                        </div>
                        <Row style={{ marginBottom: '40px' }}>
                            <Col span={24}>
                                <WorkOrderDropArea
                                    workOrders={props.managedDispatch.workOrders}
                                    onWorkOrderRemoved={onWorkOrderRemoved}
                                    onDrop={onWorkOrderAssigned}
                                    onDateRangeChanged={onDateRangeChanged}
                                    handleFullTime={handleFullTime}
                                    setTestsModal={handleTestsModalOpen}
                                    createPickupRequest={createPickupRequest}
                                />
                            </Col>
                        </Row>
                        <div className="profile-management-title">
                            <span>{strings.DISPATCH.LABELS.CONTACT_DETAILS_LABEL}</span>
                            {!isTemporaryClient &&
                                (isContactHidden
                                    ? <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => handleVisibility(CONTACT_FORM_CLASS_NAME, setContactFormClassName, isContactHidden, setIsContactHidden)} icon={<DownOutlined />} />
                                    : <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => { handleVisibility(CONTACT_FORM_CLASS_NAME, setContactFormClassName, isContactHidden, setIsContactHidden) }} icon={<UpOutlined />} />
                                )
                            }
                        </div>
                        <Form form={dispatchForm} name="dispatch-default-form">
                            <div className={contactFormClassName}>
                                <Row>
                                    <Col span={24}>
                                        <CustomSingleOptionSelect handleChange={handleCreateContactForm} name="contactId" placeholder={strings.DISPATCH.LABELS.CONTACT_DETAILS_PLACEHOLDER} options={contactDetailsSelectOptions()} allowClear={true} />
                                    </Col>
                                </Row>
                                {
                                    isContactFormDisplayed && (
                                        <Form form={dispatchContactForm} name="dispatch-contact-form">
                                            <Row>
                                                <Col span={11}>
                                                    <CustomInput name="fullName" rules={rules} placeHolder={strings.DISPATCH.LABELS.CONTACT_NAME} />
                                                </Col>
                                                <Col span={11} offset={2}>
                                                    <CustomInput name="email" rules={emailRule} placeHolder={strings.DISPATCH.LABELS.CONTACT_EMAIL} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={11}>
                                                    <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                                                        name="contactNumberCell"
                                                        rules={[{ validator: maskedPhoneNumberRule }]}
                                                        placeHolder={strings.COMMON.CONTACT_NUMBER_CELL}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form>
                                    )
                                }
                            </div>
                            <div>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name="notes">
                                            <TextArea className="dispatch-notes-component" placeholder={strings.DISPATCH.LABELS.NOTES} allowClear />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                        <div className="profile-management-title">
                            <span>{`${strings.DISPATCH.LABELS.CLIENT_DETAILS} ${isTemporaryClient ? "(TEMPORARY BUSINESS PARTY)" : ""}`}</span>
                            {
                                !isProjectDisabled &&
                                <Switch
                                    style={{
                                        float: 'right'
                                    }}
                                    checked={isTemporaryClient}
                                    onChange={handleTempClient}
                                    checkedChildren={'Empty'}
                                    unCheckedChildren={'Business Party'} />
                            }
                            {!isTemporaryClient &&
                                (isClientHidden
                                    ? <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => handleVisibility(CLIENT_FORM_CLASS_NAME, setClientFormClassName, isClientHidden, setClientHidden)} icon={<DownOutlined />} />
                                    : <Button className="unassign-btn" style={{ marginLeft: '10px' }} onClick={() => { handleVisibility(CLIENT_FORM_CLASS_NAME, setClientFormClassName, isClientHidden, setClientHidden); setCurrentTabKey('1') }} icon={<UpOutlined />} />
                                )
                            }
                            {isClientDisabled &&
                                <Tooltip title={strings.COMMON.UNASSIGN}>
                                    <Popconfirm
                                        placement="top"
                                        title={strings.COMMON.UNASSIGN_BUTTON_CONFIRM}
                                        onConfirm={handleClientUnassign}
                                        okText={strings.COMMON.OK}
                                        cancelText={strings.COMMON.CANCEL}
                                    >
                                        <Button className="unassign-btn" style={{ marginLeft: '100%' }} icon={<CloseOutlined />} />
                                    </Popconfirm>
                                </Tooltip>
                            }
                        </div>
                        <div className={clientFormClassName}>
                            <ClientDropArea onDrop={clientOnDrop}>
                                <Form form={clientForm} name="client-name" onFieldsChange={handleClientFieldsChange}>
                                    <Row>
                                        <Col span={11}>
                                            <CustomInput name="companyId" disabled={isClientDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.COMPANY_ID} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={11}>
                                            <CustomInput name="company" disabled={isClientDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.COMPANY_NAME} />
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <CustomSingleOptionSelect disabled={isClientDisabled} placeholder={strings.COMMON.SITE} name="site" options={clientSiteSelectOptions} rules={rules} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={11}>
                                            <CustomInput name="address" disabled={isClientDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.ADDRESS} />
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <CustomInput name="addressLine" disabled={isClientDisabled} placeHolder={strings.DISPATCH.LABELS.ADDRESS_LINE} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={11}>
                                            <CustomInput name="city" disabled={isClientDisabled} rules={rules} placeHolder={strings.DISPATCH.LABELS.CITY} />
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <CustomSingleOptionSelect disabled={isClientDisabled} placeholder={strings.COMMON.STATE} name="state" options={stateSelectOptions} rules={rules} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={11}>
                                            <CustomInput name="zipCode" disabled={isClientDisabled} rules={zipCodeRule} placeHolder={strings.DISPATCH.LABELS.ZIP} />
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                                                name="officeNumber"
                                                disabled={isClientDisabled}
                                                rules={[{ validator: maskedPhoneNumberRule }]}
                                                placeHolder={strings.DISPATCH.LABELS.PHONE_NUMBER}
                                            />
                                        </Col>
                                    </Row>
                                </Form>
                            </ClientDropArea>
                        </div>
                    </div>
                    <div className="custom-divider"></div>
                    <Row justify="end" className="submit-project-btn">
                        <Popconfirm
                            placement="top"
                            title={strings.COMMON.CANCEL_BUTTON_CONFIRM}
                            onConfirm={() => history.goBack()}
                            okText={strings.COMMON.OK}
                            cancelText={strings.COMMON.CANCEL}
                        >
                            <CustomBtn type="default" name="Cancel" />
                        </Popconfirm>
                        <Popconfirm
                            placement="top"
                            title={props.editingStatus ? strings.COMMON.SAVE_CHANGES_CONFIRM : strings.COMMON.SAVE_DISPATCH}
                            onConfirm={handleSubmit}
                            okText={strings.COMMON.OK}
                            cancelText={strings.COMMON.CANCEL}
                        >
                            <CustomBtn type="primary" name={props.editingStatus ? strings.DISPATCH.LABELS.EDIT_DISPATCH : strings.DISPATCH.LABELS.ADD_DISPATCH} />
                        </Popconfirm>
                    </Row>
                </div>
                <UpsertTestModal
                    isModalVisible={isTestsModalVisible}
                    handleCancel={() => setTestsModalVisible(false)}
                    workOrderId={testsWorkOrderId}
                    workOrderTypeId={props.managedDispatch.workOrders.find(item => item.id == testsWorkOrderId)?.workOrderReportTypeId}
                />
            </div>
        </DndProvider>
    );
};

const mapState = ({ dispatch, authorizedLayout }) => {
    return {
        user: authorizedLayout.user,
        allSites: authorizedLayout.allSites,
        workOrders: dispatch.workOrders,
        managedDispatch: dispatch.managedDispatch,
        projectSearchCriteria: dispatch.projectSearchCriteria,
        filteredProjects: dispatch.filteredProjects,
        clientSearchCriteria: dispatch.clientSearchCriteria,
        filteredClients: dispatch.filteredClients,
        assignedItems: dispatch.assignedItems,
        editingStatus: dispatch.editingStatus,
        states: authorizedLayout.states,
        editingDispatch: dispatch.editingDispatch,
        filteredWorkOrders: dispatch.filteredOrders,
        dispatchRequestWorkOrderConcreteTests: dispatch.dispatchRequestWorkOrderConcreteTests,
        dispatchRequestWorkOrderSoilTests: dispatch.dispatchRequestWorkOrderSoilTests
    }
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setWorkOrders(values) {
            dispatch(actions.setWorkOrders(values));
        },
        assignWorkOrders(values) {
            dispatch(actions.assignWorkOrders(values));
        },
        unassignWorkOrder(id) {
            dispatch(actions.unassignWorkOrder(id));
        },
        assignWorkOrder(workType, id) {
            dispatch(actions.assignWorkOrder(workType, id));
        },
        setStates(states) {
            dispatch(globalActions.setStates(states));
        },
        setHideStatus(id, value) {
            dispatch(actions.setHideStatus(id, value));
        },
        changeProjectSearchCriteria(name, value) {
            dispatch(actions.changeProjectSearchCriteria(name, value));
        },
        setFilteredProjects(values) {
            dispatch(actions.setFilteredProjects(values));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        changeClientSearchCriteria(name, value) {
            dispatch(actions.changeClientSearchCriteria(name, value));
        },
        setFilteredClients(values) {
            dispatch(actions.setFilteredClients(values));
        },
        setAssignedItem(name, values) {
            dispatch(actions.setAssignedItem(name, values));
        },
        setInitialSearchCriterias() {
            dispatch(actions.setInitialSearchCriterias());
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value))
        },
        setFilteredWorkOrders(value) {
            dispatch(actions.setFilteredWorkOrders(value));
        },
        setWorkOrderDateRange(id, value) {
            dispatch(actions.setWorkOrderDateRange(id, value));
        },
        createPickupRequest(id) {
            dispatch(actions.createPickupRequest({ id }));
        },
        setFullTimeWorkOrder(id, value) {
            dispatch(actions.setFullTimeWorkOrder(id, value))
        }
    }
}

export default connect(mapState, mapDispatch)(DispatchManagementPage);