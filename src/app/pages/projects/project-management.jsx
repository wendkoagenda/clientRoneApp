import React, { useEffect, useRef, useState } from 'react';
import {
    Form,
    notification,
    List,
    Row,
    Col,
    Spin,
    Switch,
    Typography,
    Popconfirm,
    Tooltip
} from 'antd';
const { Title } = Typography;
import { SearchOutlined, LoadingOutlined, CloseCircleOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import { actions } from './projects-reducer'
import { actions as dispatchActions } from '../dispatch-management/dispatch-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions as budgetActions } from './budget-constructor/budget-reducer';
import { CustomInput, SearchInput, CustomBtn, CustomSingleOptionSelect } from '../../components/common';
import { strings, sites, pageNumbers } from '../../constants';
import { connect } from 'react-redux';
import { projectNumberRule, rules, zipCodeRule } from '../../helpers/validation-rules';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { ProjectsService, ClientsService, StatesService, UserManagement, DispatchService, BudgetService } from '../../services';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ClientBadge from "./projects-dnd/client-badge";
import ClientDropArea from "./projects-dnd/client-drop-area"
import EmployeeDropArea from './projects-dnd/employee-drop-area';
import EmployeeBadge from './projects-dnd/employee-badge';
import history from '../../history';
import routes from '../routes';
import DispatchListModal from './dispatch-list.modal';
import { useDebouncedCallback } from 'use-debounce';
import BudgetConstructor from './budget-constructor/budget-constructor.modal';
import ReportsDistribution from './reports-distribution.modal';
import { useParams } from 'react-router';

const ProjectManagementPage = (props) => {
    const [projectForm] = Form.useForm();
    const [isClientsLoading, setIsClientsLoading] = useState(false);
    const [addOrUpdateInProgress, setAddOrUpdateInProgress] = useState(false);
    const [dispatchListVisible, setDispatchListVisible] = useState(false);
    const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
    const { projectId } = useParams();

    const clientsSearchInputRef = useRef('');

    const {
        budgetSearchRequest,
        setWorkOrders,
        onReportsDistributionModalOpened
    } = props;

    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const handleSubmit = async () => {
        const projectModel = await projectForm.validateFields();

        setAddOrUpdateInProgress(true);

        try {
            projectModel.clientIds = props.project.clients.map(item => item.id);
            projectModel.contactIds = props.project.contacts.map(item => item.id);
            projectModel.clients = props.project.clients;
            projectModel.contacts = props.project.contacts;
            projectModel.country = 'USA';
            projectModel.projectManager = props.projectManagers.find(item => item.id == projectModel.projectManagerId);
            projectModel.primaryClientId = props.primaryClientId;

            const budgetItems = [];
            props.budgetItems.forEach(x => {
                if (!x.workOrderId) {
                    const relatedMetrics = props.budgetItems.filter(wo => wo.workOrderId == x.id);

                    budgetItems.push({
                        id: x.budgetItemId,
                        item: x.id,
                        description: x.title,
                        section: x.category,
                        priceLevel: x.priceLevel,
                        quantity: x.quantity,
                        amount: x.amount,
                        total: x.total,
                        extraMetrics: relatedMetrics.map(m => {
                            return {
                                invoiceExtraMetricDescriptionId: m.invoiceExtraMetricDescriptionId,
                                quantity: +m.quantity,
                                amount: +m.amount,
                                total: +m.total
                            };
                        })
                    });
                }
            });

            if (props.editingStatus) {
                projectModel.id = props.editProject.id;

                await ProjectsService.editProject(projectModel);
                notification['success']({
                    message: strings.PROJECTS.NOTIFICATIONS.EDIT_SUCCESSFUL,
                });

                if (budgetItems && budgetItems.length) {
                    await BudgetService.upsertProjectBudget({
                        projectId: props.editProject.id,
                        budgetItems: budgetItems
                    });
                    notification['success']({
                        message: strings.PROJECTS.NOTIFICATIONS.BUDGET_STORED
                    });
                }
            }
            else {
                const createProjectResponse = await ProjectsService.createProject(projectModel);
                notification['success']({
                    message: strings.PROJECTS.NOTIFICATIONS.CREATE_SUCCESSFUL,
                });

                if (budgetItems && budgetItems.length) {
                    const newProjectId = createProjectResponse?.data?.data?.id;
                    await BudgetService.upsertProjectBudget({
                        projectId: newProjectId,
                        budgetItems: budgetItems
                    });
                    notification['success']({
                        message: strings.PROJECTS.NOTIFICATIONS.BUDGET_STORED
                    });
                }
            }

            history.push(routes.PROJECTS);
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, 'Error');
            notification['error']({
                message: errorMessage,
            });
            setAddOrUpdateInProgress(false);
        }

        projectForm.resetFields();
        setAddOrUpdateInProgress(false);
    };

    const loadClients = async () => {
        setIsClientsLoading(true);

        try {
            const clientsResponse = await ClientsService.searchAllByRequest(props.clientsSearchCriteria);

            const clients = clientsResponse.data.data.map(item => {
                return {
                    ...item,
                    isHidedEmployees: true
                };
            });

            props.setClients(clients);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_CLIENTS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsClientsLoading(false);
    };

    const loadWorkOrders = async () => {
        try {
            const workOrdersResponse = await DispatchService.getAllWorkOrder();

            props.setCategoriesOptions([{
                key: strings.COMMON.ALL_CATEGORIES,
                value: strings.COMMON.ALL_CATEGORIES
            }, ...Object.keys(workOrdersResponse.data.data).map(item => {
                return {
                    key: item,
                    value: item
                }
            })]);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const loadProjectManagers = async () => {
        try {
            if (!props.projectManagers || !props.projectManagers.length) {
                const managersResponse = await UserManagement.getProjectManagers();

                props.setProjectManagers(managersResponse.data.data);
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_MANAGERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const loadResponsiblePersons = async () => {
        try {
            if (!props.projectPersons || !props.projectPersons.length) {
                const projectPersonsResponse = await UserManagement.getProjectResponsiblePersons();
                if (projectPersonsResponse?.data?.data) {
                    props.setProjectPersons(projectPersonsResponse.data.data);
                }
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_RESPONSIBLE_PERSONS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const renderClientBadge = (item) => {
        return (
            <>
                <ClientBadge item={item}
                    openContactsList={props.openContactsList}
                    closeContactsList={props.closeContactsList}
                    isSelected={!!props.project.clients && props.project.clients.some(cl => cl.id == item.id)}
                />
                {
                    !item.isHidedEmployees && item.contacts.length > 0 && (
                        <List key="id"
                            className="employees-list"
                            size="small"
                            dataSource={item.contacts}
                            renderItem={emp => <EmployeeBadge item={emp} clientId={item.id} isSelected={!!props.project.contacts && props.project.contacts.some(e => (e.id == emp.id && e.clientId == emp.clientId))} />} />
                    )
                }
            </>
        );
    };

    const onSearch = useDebouncedCallback((searchString) => {
        props.setClientsSearchRequestSearchCriteria(searchString);
    }, 400);

    const setFiltering = (siteName) => {
        props.setClientsSearchRequestSites(siteName);
    }

    const clearFiltering = () => {
        clientsSearchInputRef.current.state.value = "";
        props.setInitialClientsSearchRequest();
    }

    const onClientAssigned = ({ clientId }) => {
        props.assignClient(clientId);
    };

    const onClientRemoved = (clientId) => {
        props.unassignClient(clientId);
    };

    const onEmployeeAssigned = ({ clientId, contactId }) => {
        props.assignContact(clientId, contactId);
    };

    const onEmployeeRemoved = (clientId, contactId) => {
        props.unassignContact(clientId, contactId);
    };

    const stateSelectOptions = props.states.map(state => {
        return {
            key: state.id,
            value: state.name
        };
    });

    const sitesSelectOptions = (props.user.sites && props.allSites.length) && props.user.sites.map(siteId => {
        return {
            key: siteId,
            value: siteId,
            displayValue: props.allSites.find(item => item.id == siteId)?.name,
        };
    });

    const managersSelectOptions = props.projectManagers.map(manager => {
        return {
            key: manager.id,
            value: manager.id,
            displayValue: manager.fullName
        };
    });

    const projectPersons = props.projectPersons.map(person => {
        return {
            key: person.id,
            value: person.id,
            displayValue: `${person.fullName}, ${person.signatureTitle}`
        };
    });

    const getProjectById = async (projectId) => {
        try {
            const response = await ProjectsService.getProjectById(projectId);
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

    const loadDispatches = async () => {
        try {
            const response = await DispatchService.getByProjectId(props.editProjectId);
            if (response && response.data && response.data.data) {
                props.setDispatches(response.data.data);
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_FETCH_DISPATCHES_PER_PROJECT);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const gotoEditDispatchPage = async (dispatchId) => {
        try {
            const dispatchResponse = await DispatchService.getById(dispatchId);

            props.clearEditingDispatch();
            props.setEditingDispatchModel(dispatchResponse.data.data);
            history.push(routes.DISPATCH_MANAGEMENT);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_OPEN_CURRENT_DISPATCH);
            notification['error']({
                message: errorMessage
            });
        }
    };

    const handleSetFormValues = async () => {
        await loadProjectManagers();
        await loadResponsiblePersons();
        await loadWorkOrders();

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
            const project = await getProjectById(props.editProjectId);

            projectForm.setFieldsValue(project);
            props.setProjectValues({
                clients: project.clients,
                contacts: project.contacts
            });

            props.setEditProject(project);
            await loadDispatches();

            if (project.site.name.includes(sites.JRB)) {
                props.changeLogoState(false);
            }
            else {
                props.changeLogoState(true);
            }
        }
    }

    useEffect(() => {
        const loadBudgetSheetWorkOrders = async () => {
            try {
                const ordersResponse = await BudgetService.searchPricingSheetOrders(budgetSearchRequest);

                setWorkOrders(ordersResponse.data.data);
            } catch (error) {
                TrackingService.trackException(error);
                const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
                notification['error']({
                    message: errorMessage,
                });
            }
        };

        loadBudgetSheetWorkOrders();
    }, [budgetSearchRequest, setWorkOrders])

    useEffect(() => {
        (async () => {
            await loadClients();
        })();
    }, [props.clientsSearchCriteria])

    useEffect(() => {
        props.setGlobalSpinState(true);

        handleSetFormValues().then(() => {
            props.setGlobalSpinState(false);
        })
    }, [props.budgetAvailable]);

    useEffect(() => {
        if (projectId > 0) {
            props.setPageInfo(strings.PAGES.PROJECT_MANAGEMENT.EDIT, pageNumbers.PROJECTS);
            getProjectById(projectId).then((project) => {
                if (!project) {
                    props.setPageInfo(strings.PAGES.PROJECT_MANAGEMENT.ADD, pageNumbers.PROJECTS);
                }
                projectForm.setFieldsValue(project);
                props.setProjectValues({
                    clients: project.clients,
                    contacts: project.contacts
                });
                props.setEditProject(project);
                props.setEditProjectId(projectId);
            });
        } else {
            props.setPageInfo(strings.PAGES.PROJECT_MANAGEMENT.ADD, pageNumbers.PROJECTS);
            props.setProjectValues({
                clients: [],
                contacts: []
            });
            projectForm.resetFields();
        }
    }, [])

    const handleReportsRedirect = () => {
        history.push({
            pathname: routes.GET_REPORTS_TABLE_ROUTE(props.editProjectId)
        })
    }

    const handleBudgetComparisonRedirect = () => {
        history.push({
            pathname: routes.GET_BUDGET_COMPARISON_ROUTE(props.editProjectId)
        })
    }

    const handleBudgetModalCancel = () => {
        setBudgetModalVisible(false);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="project-manage-layout">
                <div className="project-clients-container">
                    <div className="search-top">
                        <div className="search-btns">
                            <h2>{strings.COMMON.SORT_BY}</h2>
                            <CustomBtn name="JRB" onClick={() => setFiltering('JRB')} ></CustomBtn>
                            <CustomBtn name="Rone" onClick={() => setFiltering('Rone')} ></CustomBtn>
                            <CustomBtn className="cancel-btn" onClick={clearFiltering} icon={<CloseCircleOutlined />}></CustomBtn>
                        </div>
                        <SearchInput placeholder="Search Business Parties" searchInputRef={clientsSearchInputRef} defaultValue={props.clientsSearchCriteria.searchCriteria} onChange={e => onSearch(e.target.value)} prefix={<SearchOutlined />} />
                    </div>
                    {isClientsLoading
                        ? (
                            <div className="table-spinner">
                                <Spin indicator={loadingIcon} />
                            </div>
                        )
                        : (
                            <div className="clients-wrapper">
                                <List key="id" size="small" dataSource={props.clients} renderItem={renderClientBadge} />
                            </div>
                        )
                    }
                </div>
                <div className="project-form-container">
                    <Form form={projectForm} initialValues={{ isActive: props.editingStatus ? (props.editProject ? props.editProject.isActive : false) : true, isTemporary: props.editingStatus ? (props.editProject ? props.editProject.isTemporary : false) : false }}>
                        <div className="profile-management-title">
                            <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.PROJECT_DETAILS}</span>
                        </div>
                        <Row>
                            <Col span={11}>
                                <CustomInput name="name" rules={rules} placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.NAME} />
                            </Col>
                            <Col span={11} offset={2}>
                                <CustomInput name="shortName" placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.SHORT_NAME} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <CustomInput name="number" type="number" rules={[{ validator: projectNumberRule }]} placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.NUMBER} />
                            </Col>
                            <Col span={11} offset={2}>
                                <CustomSingleOptionSelect placeholder={strings.COMMON.SITE} name="siteId" options={sitesSelectOptions} rules={rules} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <div className="budget-input">
                                    <CustomInput
                                        name="budget"
                                        type="number"
                                        placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.BUDGET}
                                        disabled={props.budgetAvailable}
                                    />
                                    <Tooltip title={strings.COMMON.USE_BUDGE_CONSTRUCTOR}>
                                        <DollarOutlined onClick={() => setBudgetModalVisible(true)} />
                                    </Tooltip>
                                </div>
                            </Col>
                            <Col span={11} offset={2}>
                                <CustomInput name="defaultNumberOfSpecimens" placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.DEFAULT_NUMBER_OF_SPEC} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <CustomInput name="address" rules={rules} placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ADDRESS} />
                            </Col>
                            <Col span={11} offset={2}>
                                <CustomInput name="addressLine" placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ADDRESS_LINE} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <CustomInput name="city" rules={rules} placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CITY} />
                            </Col>
                            <Col span={11} offset={2}>
                                <CustomSingleOptionSelect placeholder={strings.COMMON.STATE} name="state" options={stateSelectOptions} rules={rules} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <CustomInput name="zipCode" rules={zipCodeRule} placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.ZIP} />
                            </Col>
                        </Row>
                        <div className="profile-management-title">
                            <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CLIENT_DETAILS}</span>
                        </div>
                        <Row>
                            <Col span={24}>
                                {
                                    <ClientDropArea setPrimaryClientId={props.setPrimaryClientId} primaryClientId={props.primaryClientId} clients={props.project.clients} onDrop={onClientAssigned} onRemove={onClientRemoved} />
                                }
                            </Col>
                        </Row>
                        <div className="profile-management-title">
                            <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.CONTACT_DETAILS}</span>
                        </div>
                        <Row>
                            <Col span={24}>
                                <EmployeeDropArea
                                    contacts={props.project.contacts}
                                    onEmployeeRemoved={onEmployeeRemoved}
                                    onDrop={onEmployeeAssigned}
                                    onPaymentStateChanged={props.onContactPaymentStateChanged}
                                    onReportsDistributionOpened={onReportsDistributionModalOpened} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <div className="profile-management-title">
                                    <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.PROJECT_MANAGER}</span>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="profile-management-title">
                                    <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.PROJECT_RESPONSIBLE_PERSON}</span>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <CustomSingleOptionSelect
                                    allowClear={true}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.CHOOSE_PROJECT_MANAGER}
                                    name="projectManagerId"
                                    options={managersSelectOptions} />
                            </Col>
                            <Col offset={1} span={11}>
                                <CustomSingleOptionSelect
                                    allowClear={true}
                                    placeHolder={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.CHOOSE_PROJECT_RESPONSIBLE_PERSON}
                                    name="projectResponsiblePersonId"
                                    options={projectPersons} />
                            </Col>
                        </Row>
                        <div className="profile-management-title">
                            <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.PROPERTIES.PROJECT_STATUS}</span>
                        </div>
                        <Row>
                            <Col span={12}>
                                <Title level={5}>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.IS_ACTIVE}</Title>
                                <Form.Item name="isActive" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Title level={5}>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.IS_TEMPORARY}</Title>
                                <Form.Item name="isTemporary" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="custom-divider"></div>
                        <Row className="submit-project-btn">
                            <Col span={14}>
                                <Row>
                                    {
                                        props.editingStatus && (
                                            <>
                                                <Col>
                                                    <CustomBtn type="default" name="Dispatches" onClick={() => setDispatchListVisible(true)} />
                                                </Col>
                                                <Col>
                                                    <CustomBtn icon={<FileTextOutlined style={{ fontSize: '22px', marginRight: '-3px' }} />} type="default" name={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.REPORTS} onClick={handleReportsRedirect} />
                                                </Col>
                                                <Col>
                                                    <CustomBtn type="default" name={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.BUDGET_COMPARISON} onClick={handleBudgetComparisonRedirect} />
                                                </Col>
                                            </>
                                        )
                                    }
                                </Row>
                            </Col>
                            <Col span={10}>
                                <Row justify="end">
                                    <Popconfirm
                                        placement="top"
                                        title={strings.COMMON.CANCEL_BUTTON_CONFIRM}
                                        onConfirm={() => history.push(routes.PROJECTS)}
                                        okText={strings.COMMON.OK}
                                        cancelText={strings.COMMON.CANCEL}
                                    >
                                        <CustomBtn type="default" name="Cancel" />
                                    </Popconfirm>
                                    {
                                        !props.editingStatus ? (
                                            <Popconfirm
                                                placement="top"
                                                title={strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.ADD_NEW_PROJECT_CONFIRM}
                                                onConfirm={handleSubmit}
                                                okText={strings.COMMON.OK}
                                                cancelText={strings.COMMON.CANCEL}
                                            >
                                                <CustomBtn type="primary" name={strings.COMMON.ADD_PROJECT} />
                                            </Popconfirm>
                                        ) : (
                                            <Popconfirm
                                                placement="top"
                                                title={strings.COMMON.SAVE_CHANGES_CONFIRM}
                                                onConfirm={handleSubmit}
                                                okText={strings.COMMON.OK}
                                                cancelText={strings.COMMON.CANCEL}
                                            >
                                                <CustomBtn isLoading={addOrUpdateInProgress} type="primary" name={strings.COMMON.SAVE_CHANGES} />
                                            </Popconfirm>
                                        )
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
            <BudgetConstructor
                isBudgetModalVisible={isBudgetModalVisible}
                handleBudgetModalCancel={handleBudgetModalCancel}
                projectId={props.editProjectId}
            />
            <DispatchListModal
                visible={dispatchListVisible}
                dispatches={props.dispatchesPerProject}
                onClose={() => setDispatchListVisible(false)}
                onClick={gotoEditDispatchPage} />
            <ReportsDistribution />
        </DndProvider>
    );
};

const mapState = ({ projects, authorizedLayout, budget }) => {
    return {
        editingStatus: projects.editingStatus,
        clients: projects.clients,
        project: projects.project,
        states: authorizedLayout.states,
        user: authorizedLayout.user,
        allSites: authorizedLayout.allSites,
        projectManagers: projects.projectManagers,
        clientsSearchString: projects.clientsSearchString,
        editProjectId: projects.editProjectId,
        editProject: projects.editProject,
        primaryClientId: projects.primaryClientId,
        dispatchesPerProject: projects.dispatchesPerProject,
        projectPersons: projects.projectResponsiblePersons,
        clientsSearchCriteria: projects.clientsSearchCriteria,
        budgetSearchRequest: budget.budgetSearchRequest,
        budgetItems: budget.assignedWorkOrders,
        budgetAvailable: budget.budgetAvailable
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setClients(value) {
            dispatch(actions.setClients(value));
        },
        assignClient(value) {
            dispatch(actions.assignClient(value));
        },
        unassignClient(value) {
            dispatch(actions.unassignClient(value));
        },
        assignContact(clientId, contactId) {
            dispatch(actions.assignContact({ clientId: clientId, contactId: contactId }));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        unassignContact(clientId, contactId) {
            dispatch(actions.unassignContact({ clientId: clientId, contactId: contactId }));
        },
        openContactsList(id) {
            dispatch(actions.openContacts(id));
        },
        closeContactsList(id) {
            dispatch(actions.closeContacts(id));
        },
        setStates(states) {
            dispatch(globalActions.setStates(states));
        },
        setProjectManagers(values) {
            dispatch(actions.setProjectManagers(values));
        },
        setProjectValues(values) {
            dispatch(actions.setProjectValues(values));
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value));
        },
        setPrimaryClientId(id) {
            dispatch(actions.setPrimaryClientId(id));
        },
        setEditProject(project) {
            dispatch(actions.setEditProject(project));
        },
        setDispatches(value) {
            dispatch(actions.setDispatches(value));
        },
        clearEditingDispatch() {
            dispatch(dispatchActions.clearEditingDispatch());
        },
        setEditingDispatchModel(value) {
            dispatch(dispatchActions.setEditingDispatchModel(value));
        },
        setProjectPersons(value) {
            dispatch(actions.setProjectPersons(value));
        },
        setClientsSearchRequestSearchCriteria(value) {
            dispatch(actions.setClientsSearchRequestSearchCriteria(value));
        },
        setClientsSearchRequestSites(siteName) {
            dispatch(actions.setClientsSearchRequestSites([siteName]));
        },
        setInitialClientsSearchRequest() {
            dispatch(actions.setInitialClientsSearchRequest());
        },
        clearSelectedValues() {
            dispatch(actions.clearSelectedValues());
        },
        setWorkOrders(values) {
            dispatch(budgetActions.setWorkOrders(values));
        },
        setCategoriesOptions(values) {
            dispatch(budgetActions.setCategoriesOptions(values));
        },
        onContactPaymentStateChanged(contactId) {
            dispatch(actions.toggleProjectContactsPaymentsResponsibleState(contactId));
        },
        onReportsDistributionModalOpened(contactId) {
            dispatch(actions.setReportsDistributionModalState(true));
            dispatch(actions.setReportDistributionContactId(contactId));
        },
        setEditProjectId(id) {
            dispatch(actions.setEditProjectId(id));
        }
    }
}

export default connect(mapState, mapDispatch)(ProjectManagementPage);