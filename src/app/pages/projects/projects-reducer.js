/***************************************** INITIAL STATE ********************************************/
const INITIAL_PROJECTS_SEARCH_REQUEST = {
    searchCriteria: '',
    sites: [],
    sortCriteria: 'name',
    isTemporaryClient: false,
    isTemporarySite: false,
    isAscend: true,
    pageNumber: 1,
    pageSize: 100,
    isTemporary: null,
    isFiltered: false
};

const INITIAL_CLIENTS_SEARCH_REQUEST = {
    searchCriteria: '',
    sites: [],
    isFiltered: false
};

const INITIAL_STATE = {
    filteredSites: [],
    projectsSearchRequest: INITIAL_PROJECTS_SEARCH_REQUEST,
    paginatedProjects: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    },

    // project management
    clients: [],
    clientsSearchCriteria: INITIAL_CLIENTS_SEARCH_REQUEST,
    project: {
        clients: [],
        contacts: []
    },
    projectManagers: [],
    editingStatus: false,
    editProjectId: 0,
    editProject: null,
    primaryClientId: 0,
    dispatchesPerProject: [],
    projectResponsiblePersons: [],
    selectedValuesForBudget: [],
    selectedRows: [],
    workOrders: [],
    isReportsDistributionModalVisible: false,
    reportDistributionContactId: 0
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "PROJECT_";
const actionTypes = {
    SET_EDIT_MODE: 'SET_EDIT_MODE',
    SET_CLIENTS: 'SET_CLIENTS',
    ASSIGN_CLIENT: 'ASSIGN_CLIENT',
    UNASSIGN_CLIENT: 'UNASSIGN_CLIENT',
    ASSIGN_CONTACT: 'ASSIGN_CONTACT',
    UNASSIGN_CONTACT: 'UNASSIGN_CONTACT',
    OPEN_CONTACTS: 'OPEN_CONTACTS',
    CLOSE_CONTACTS: 'CLOSE_CONTACTS',
    SET_PROJECT_MANAGERS: 'SET_PROJECT_MANAGERS',
    CLEAR_EDITABLE: 'CLEAR_EDITABLE',
    SET_PROJECT_VALUES: 'SET_PROJECT_VALUES',
    SET_FILTERED_SITES: 'SET_FILTERED_SITES',
    SET_EDIT_PROJECT_ID: 'PROJECTS_SET_EDIT_PROJECT_ID',
    SET_PRIMARY_CLIENT_ID: 'PROJECTS_SET_PRIMARY_CLIENT_ID',
    SET_EDIT_PROJECT: 'PROJECTS_SET_EDIT_PROJECT',
    SET_DISPATCHES_PER_PROJECTS: 'PROJECTS_SET_DISPATCHES_PER_PROJECT',
    SET_PROJECT_RESPONSIBLE_PERSONS: 'PROJECT_SET_PROJECT_RESPONSIBLE_PERSONS',
    SET_PROJECTS_SEARCH_REQUEST_PROJECT_STATUS: 'PROJECTS_SET_PROJECTS_SEARCH_REQUEST_PROJECT_STATUS',
    SET_INITIAL_PROJECTS_SEARCH_REQUEST: 'PROJECTS_SET_INITIAL_PROJECTS_SEARCH_REQUEST',
    SET_PAGINATED_PROJECTS: 'PROJECTS_SET_PAGINATED_PROJECTS',
    SET_PROJECTS_SEARCH_REQUEST_CRITERIA: 'PROJECTS_SET_PROJECTS_SEARCH_REQUEST_CRITERIA',
    SET_PROJECTS_SEARCH_REQUEST_SORTER: 'PROJECTS_SET_PROJECTS_SEARCH_REQUEST_SORTER',
    SET_PROJECTS_SEARCH_REQUEST_PAGINATION: 'PROJECTS_SET_PROJECTS_SEARCH_REQUEST_PAGINATION',
    PREPARE_FILTERED_SITES: 'PROJECTS_PREPARE_FILTERED_SITES',
    SET_CLIENTS_SEARCH_REQUEST_SEARCH_CRITERIA: 'CLIENTS_SET_CLIENTS_SEARCH_REQUEST_SEARCH_CRITERIA',
    SET_CLIENTS_SEARCH_REQUEST_SITES: 'CLIENTS_SET_CLIENTS_SEARCH_REQUEST_SITES',
    SET_INITIAL_CLIENTS_SEARCH_REQUEST: 'CLIENTS_SET_INITIAL_CLIENTS_SEARCH_REQUEST',
    SET_SELECTED_VALUE_FOR_BUDGET: 'SET_SELECTED_VALUE_FOR_BUDGET',
    CLEAR_SELECTED_BUDGET: 'CLEAR_SELECTED_BUDGET',
    SET_SELECTED_ROWS: 'SET_SELECTED_ROWS',
    SET_TEMPORARY_CLIENT_STATUS: 'SET_TEMPORARY_CLIENT_STATUS',
    SET_TEMPORARY_SITE_STATUS: 'SET_TEMPORARY_SITE_STATUS',
    SET_ALL_PROJECTS_SEARCH_REQUEST: 'SET_ALL_PROJECTS_SEARCH_REQUEST',
    SET_WORK_ORDERS: `${reducerName}SET_WORK_ORDERS`,
    TOGGLE_PROJECT_CONTACT_PAYMENTS_RESPONSIBLE_STATE: `${reducerName}TOGGLE_PROJECT_CONTACT_PAYMENTS_RESPONSIBLE_STATE`,
    SET_REPORTS_DISTRIBUTION_MODAL_STATE: `${reducerName}SET_REPORTS_DISTRIBUTION_MODAL_STATE`,
    SET_REPORTS_DISTRIBUTION_CONTACT_ID: `${reducerName}SET_REPORTS_DISTRIBUTION_CONTACT_ID`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setClientsSearchRequestSearchCriteria: (payload) => ({
        type: actionTypes.SET_CLIENTS_SEARCH_REQUEST_SEARCH_CRITERIA,
        payload: payload
    }),
    setClientsSearchRequestSites: (payload) => ({
        type: actionTypes.SET_CLIENTS_SEARCH_REQUEST_SITES,
        payload: payload
    }),
    setInitialClientsSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_CLIENTS_SEARCH_REQUEST
    }),
    setEditMode: (payload) => ({
        type: actionTypes.SET_EDIT_MODE,
        payload: payload
    }),
    setClients: (payload) => ({
        type: actionTypes.SET_CLIENTS,
        payload: payload
    }),
    assignClient: (payload) => ({
        type: actionTypes.ASSIGN_CLIENT,
        payload: payload
    }),
    unassignClient: (payload) => ({
        type: actionTypes.UNASSIGN_CLIENT,
        payload: payload
    }),
    assignContact: (payload) => ({
        type: actionTypes.ASSIGN_CONTACT,
        payload: payload
    }),
    unassignContact: (payload) => ({
        type: actionTypes.UNASSIGN_CONTACT,
        payload: payload
    }),
    openContacts: (id) => ({
        type: actionTypes.OPEN_CONTACTS,
        payload: { id }
    }),
    closeContacts: (id) => ({
        type: actionTypes.CLOSE_CONTACTS,
        payload: { id }
    }),
    setProjectManagers: (values) => ({
        type: actionTypes.SET_PROJECT_MANAGERS,
        payload: { values }
    }),
    setEditingProject: (value) => ({
        type: actionTypes.SET_EDITING_PROJECT,
        payload: value
    }),
    clearEditable: () => ({
        type: actionTypes.CLEAR_EDITABLE
    }),
    setProjectValues: (values) => ({
        type: actionTypes.SET_PROJECT_VALUES,
        payload: { values }
    }),
    setFilteredSites: (values) => ({
        type: actionTypes.SET_FILTERED_SITES,
        payload: { values }
    }),
    setEditProjectId: (id) => ({
        type: actionTypes.SET_EDIT_PROJECT_ID,
        payload: id
    }),
    setPrimaryClientId: (id) => ({
        type: actionTypes.SET_PRIMARY_CLIENT_ID,
        payload: id
    }),
    setEditProject: (project) => ({
        type: actionTypes.SET_EDIT_PROJECT,
        payload: project
    }),
    setDispatches: (value) => ({
        type: actionTypes.SET_DISPATCHES_PER_PROJECTS,
        payload: value
    }),
    setProjectPersons: (value) => ({
        type: actionTypes.SET_PROJECT_RESPONSIBLE_PERSONS,
        payload: value
    }),
    setPaginatedProjects: (value) => ({
        type: actionTypes.SET_PAGINATED_PROJECTS,
        payload: value
    }),
    setProjectsSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_PROJECTS_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialProjectsSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_PROJECTS_SEARCH_REQUEST
    }),
    setProjectsSearchRequestSorter: (value) => ({
        type: actionTypes.SET_PROJECTS_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setProjectsSearchRequestPagination: (value) => ({
        type: actionTypes.SET_PROJECTS_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setProjectSearchRequestStatus: (value) => ({
        type: actionTypes.SET_PROJECTS_SEARCH_REQUEST_PROJECT_STATUS,
        payload: value
    }),
    setTemporaryClientStatus: (value) => ({
        type: actionTypes.SET_TEMPORARY_CLIENT_STATUS,
        payload: value
    }),
    setTemporarySiteStatus: (value) => ({
        type: actionTypes.SET_TEMPORARY_SITE_STATUS,
        payload: value
    }),
    setAllProjectSearchRequest: () => ({
        type: actionTypes.SET_ALL_PROJECTS_SEARCH_REQUEST
    }),
    setPreparedFilteredSites: (value) => ({
        type: actionTypes.PREPARE_FILTERED_SITES,
        payload: value
    }),
    setSelectedValueForBudget: (id, value, checked) => ({
        type: actionTypes.SET_SELECTED_VALUE_FOR_BUDGET,
        payload: { id, value, checked }
    }),
    clearSelectedValues: () => ({
        type: actionTypes.CLEAR_SELECTED_BUDGET
    }),
    setSelectedRows: (values) => ({
        type: actionTypes.SET_SELECTED_ROWS,
        payload: { values }
    }),
    setWorkOrders: (values) => ({
        type: actionTypes.SET_WORK_ORDERS,
        payload: { values }
    }),
    toggleProjectContactsPaymentsResponsibleState: (contactId) => ({
        type: actionTypes.TOGGLE_PROJECT_CONTACT_PAYMENTS_RESPONSIBLE_STATE,
        payload: contactId
    }),
    setReportsDistributionModalState: (value) => ({
        type: actionTypes.SET_REPORTS_DISTRIBUTION_MODAL_STATE,
        payload: value
    }),
    setReportDistributionContactId: (value) => ({
        type: actionTypes.SET_REPORTS_DISTRIBUTION_CONTACT_ID,
        payload: value
    })
}

/******************************************* REDUCER ************************************************/
const projectsReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_CLIENTS_SEARCH_REQUEST_SEARCH_CRITERIA:
            return {
                ...state,
                clientsSearchCriteria: {
                    ...state.clientsSearchCriteria,
                    searchCriteria: action.payload,
                    isFiltered: action.payload != '' ? true : state.clientsSearchCriteria.isFiltered
                }
            };

        case actionTypes.SET_SELECTED_ROWS:
            return {
                ...state,
                selectedRows: [...state.selectedRows, ...action.payload.values]
            }

        case actionTypes.CLEAR_SELECTED_BUDGET:
            return {
                ...state,
                selectedValuesForBudget: []
            }

        case actionTypes.SET_SELECTED_VALUE_FOR_BUDGET:
            const prevValue = state.selectedValuesForBudget.find(item => item.orderId == action.payload.id);
            return {
                ...state,
                selectedValuesForBudget: prevValue ? state.selectedValuesForBudget.map(item => {
                    if (item.orderId == action.payload.id && action.payload.checked) {
                        return {
                            orderId: action.payload.id,
                            value: action.payload.value
                        }
                    } else {
                        return item
                    }
                })
                    : [
                        ...state.selectedValuesForBudget,
                        {
                            orderId: action.payload.id,
                            value: action.payload.value
                        }
                    ]
            }

        case actionTypes.SET_CLIENTS_SEARCH_REQUEST_SITES:
            return {
                ...state,
                clientsSearchCriteria: {
                    ...state.clientsSearchCriteria,
                    sites: action.payload,
                    isFiltered: action.payload.length ? true : state.clientsSearchCriteria.isFiltered
                }
            };

        case actionTypes.SET_INITIAL_CLIENTS_SEARCH_REQUEST:
            return {
                ...state,
                clientsSearchCriteria: INITIAL_CLIENTS_SEARCH_REQUEST
            };

        case actionTypes.SET_PAGINATED_PROJECTS:
            return {
                ...state,
                paginatedProjects: action.payload
            };

        case actionTypes.SET_PROJECTS_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: action.payload != '' ? true : state.projectsSearchRequest.isFiltered
                }
            };

        case actionTypes.SET_INITIAL_PROJECTS_SEARCH_REQUEST:
            return {
                ...state,
                projectsSearchRequest: INITIAL_PROJECTS_SEARCH_REQUEST
            };

        case actionTypes.SET_PROJECTS_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_PROJECTS_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_PROJECTS_SEARCH_REQUEST_PROJECT_STATUS:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    isTemporary: action.payload,
                    isTemporarySite: false,
                    isTemporaryClient: false,
                    isFiltered: action.payload && true
                }
            };

        case actionTypes.SET_TEMPORARY_CLIENT_STATUS:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    isTemporary: null,
                    isTemporarySite: false,
                    isTemporaryClient: action.payload,
                    isFiltered: action.payload && true
                }
            }

        case actionTypes.SET_TEMPORARY_SITE_STATUS:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    isTemporary: null,
                    isTemporaryClient: false,
                    isTemporarySite: action.payload,
                    isFiltered: action.payload && true
                }
            }

        case actionTypes.SET_ALL_PROJECTS_SEARCH_REQUEST:
            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    isTemporary: null,
                    isTemporarySite: false,
                    isTemporaryClient: false
                }
            }

        case actionTypes.SET_EDIT_MODE:
            return {
                ...state,
                isEditMode: action.payload
            };

        case actionTypes.SET_CLIENTS:
            return {
                ...state,
                clients: action.payload
            };

        case actionTypes.ASSIGN_CLIENT:
            return {
                ...state,
                project: {
                    ...state.project,
                    clients: [
                        ...state.project.clients,
                        state.clients.find(item => item.id == action.payload)
                    ]
                },
                primaryClientId: !state.project.clients.length ? action.payload : state.primaryClientId
            };

        case actionTypes.UNASSIGN_CLIENT:
            let filteredClients = state.project.clients.filter(item => !(item.id == action.payload));
            let newPrimaryClientId = filteredClients.length && action.payload == state.primaryClientId
                ? filteredClients[0].id
                : state.primaryClientId;

            return {
                ...state,
                project: {
                    ...state.project,
                    clients: filteredClients
                },
                primaryClientId: newPrimaryClientId
            };

        case actionTypes.ASSIGN_CONTACT:
            return {
                ...state,
                project: {
                    ...state.project,
                    contacts: [
                        ...state.project.contacts,
                        state.clients.find(item => item.id == action.payload.clientId).contacts.find(item => item.id == action.payload.contactId)
                    ]
                }
            };

        case actionTypes.UNASSIGN_CONTACT:
            return {
                ...state,
                project: {
                    ...state.project,
                    contacts: state.project.contacts.filter(item => !(item.id == action.payload.contactId && item.clientId == action.payload.clientId))
                }
            };

        case actionTypes.OPEN_CONTACTS:
            return {
                ...state,
                clients: state.clients.map(item => {
                    if (item.id == action.payload.id) {
                        return {
                            ...item,
                            isHidedEmployees: false
                        }
                    }
                    else {
                        return item;
                    }
                })
            }

        case actionTypes.CLOSE_CONTACTS:
            return {
                ...state,
                clients: state.clients.map(item => {
                    if (item.id == action.payload.id) {
                        return {
                            ...item,
                            isHidedEmployees: true
                        }
                    }
                    else {
                        return item;
                    }
                })
            }

        case actionTypes.SET_PROJECT_MANAGERS:
            return {
                ...state,
                projectManagers: action.payload.values
            }

        case actionTypes.CLEAR_EDITABLE:
            return {
                ...state,
                editingStatus: false
            }

        case actionTypes.SET_PROJECT_VALUES:
            return {
                ...state,
                project: {
                    ...action.payload.values,
                    projectManagerId: state.projectManagers.some(pr=>pr.id == action.payload.values.projectManagerId) 
                        ? action.payload.values.projectManagerId
                        : null
                }
            }

        case actionTypes.SET_FILTERED_SITES:
            const filteredSites = state.filteredSites.filter(item => item != "Rone" && item != "JRB");

            return {
                ...state,
                projectsSearchRequest: {
                    ...state.projectsSearchRequest,
                    sites: filteredSites,
                    isFiltered: filteredSites.length ? true : state.projectsSearchRequest.isFiltered
                }
            }

        case actionTypes.SET_EDIT_PROJECT_ID:
            return {
                ...state,
                editingStatus: true,
                editProjectId: action.payload
            }

        case actionTypes.SET_PRIMARY_CLIENT_ID:
            return {
                ...state,
                primaryClientId: action.payload
            }

        case actionTypes.SET_EDIT_PROJECT:
            const primaryClientId = action.payload.primaryClientId && action.payload.primaryClientId != 0
                ? action.payload.primaryClientId
                : (action.payload.clients && action.payload.clients.length ? action.payload.clients[0].id : null);

            return {
                ...state,
                primaryClientId: primaryClientId,
                editProject: { ...action.payload, primaryClientId: primaryClientId }
            }

        case actionTypes.SET_DISPATCHES_PER_PROJECTS:
            return {
                ...state,
                dispatchesPerProject: action.payload
            }

        case actionTypes.SET_PROJECT_RESPONSIBLE_PERSONS:
            return {
                ...state,
                projectResponsiblePersons: action.payload
            }

        case actionTypes.PREPARE_FILTERED_SITES:
            return {
                ...state,
                filteredSites: action.payload
            }

        case actionTypes.SET_WORK_ORDERS:
            return {
                ...state,
                workOrders: action.payload.values
            }

        case actionTypes.TOGGLE_PROJECT_CONTACT_PAYMENTS_RESPONSIBLE_STATE:
            return {
                ...state,
                project: {
                    ...state.project,
                    contacts: state.project.contacts.map(item => {
                        if (item.id != action.payload) {
                            return item;
                        }

                        return {
                            ...item,
                            isPaymentsResponsible: !item.isPaymentsResponsible
                        }
                    })
                }
            }

        case actionTypes.SET_REPORTS_DISTRIBUTION_MODAL_STATE:
            return {
                ...state,
                isReportsDistributionModalVisible: action.payload
            }

        case actionTypes.SET_REPORTS_DISTRIBUTION_CONTACT_ID:
            return {
                ...state,
                reportDistributionContactId: action.payload
            }

        default:
            return state;
    }
}

export default projectsReducer;