/*****************************************INITIAL STATE********************************************/
const INITIAL_CLIENTS_SEARCH_REQUEST = {
    searchCriteria: '',
    sites: [],
    sortCriteria: 'company',
    isAscend: false,
    pageNumber: 1,
    pageSize: 150,
    isFiltered: false
};

const INITIAL_STATE = {
    reservedEmployee: [],
    clientSites: [],
    editingStatus: false,
    editingClient: {},
    clientsSearchRequest: INITIAL_CLIENTS_SEARCH_REQUEST,
    paginatedClients: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};

/*****************************************ACTION TYPES*********************************************/
const actionTypes = {
    GET_PROFILE_DETAILS: 'GET_PROFILE_DETAILS',
    RESERVE_EMPLOYEE: 'RESERVE_EMPLOYEE',
    RESERVE_EMPLOYEES: 'RESERVE_EMPLOYEES',
    SET_CLIENT_SITES: 'SET_CLIENTS_SITES',
    DELETE_RESERVED_EMPLOYEE: 'DELETE_RESERVED_EMPLOYEE',
    CLEAR_EDITABLE: 'CLEAR_EDITABLE',
    SET_EDITING_CLIENT: 'SET_EDITING_CLIENT',
    SET_FILTERED_SITES_FOR_CLIENTS: 'CLIENTS_SET_FILTERED_SITES_FOR_CLIENTS',
    SET_CLIENT_SITES_LABELS: 'SET_CLIENT_SITES_LABELS',
    SET_INITIAL_CLIENTS_SEARCH_REQUEST: 'CLIENTS_SET_INITIAL_CLIENTS_SEARCH_REQUEST',
    SET_PAGINATED_CLIENTS: 'CLIENTS_SET_PAGINATED_CLIENTS',
    SET_CLIENTS_SEARCH_REQUEST_CRITERIA: 'CLIENTS_SET_CLIENTS_SEARCH_REQUEST_CRITERIA',
    SET_CLIENTS_SEARCH_REQUEST_SORTER: 'CLIENTS_SET_CLIENTS_SEARCH_REQUEST_SORTER',
    SET_CLIENTS_SEARCH_REQUEST_PAGINATION: 'CLIENTS_SET_CLIENTS_SEARCH_REQUEST_PAGINATION'
};

/********************************************ACTIONS************************************************/
export const actions = {
    setUserProfile: (values) => ({
        type: actionTypes.GET_PROFILE_DETAILS,
        payload: { values }
    }),
    reserveEmployee: (values) => ({
        type: actionTypes.RESERVE_EMPLOYEE,
        payload: { values }
    }),
    reserveEmployees: (values) => ({
        type: actionTypes.RESERVE_EMPLOYEES,
        payload: { values }
    }),
    deleteReservedEmployee: (key) => ({
        type: actionTypes.DELETE_RESERVED_EMPLOYEE,
        payload: { key }
    }),
    setClientSites: (value) => ({
        type: actionTypes.SET_CLIENT_SITES,
        payload: { value }
    }),
    clearEditable: () => ({
        type: actionTypes.CLEAR_EDITABLE
    }),
    setEditingClient: (id) => ({
        type: actionTypes.SET_EDITING_CLIENT,
        payload: { id }
    }),
    setFilteredSitesForClients: (values) => ({
        type: actionTypes.SET_FILTERED_SITES_FOR_CLIENTS,
        payload: { values }
    }),
    setClientSitesName: (values) => ({
        type: actionTypes.SET_CLIENT_SITES_LABELS,
        payload: { values }
    }),
    setPaginatedClients: (value) => ({
        type: actionTypes.SET_PAGINATED_CLIENTS,
        payload: value
    }),
    setClientsSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_CLIENTS_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialClientsSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_CLIENTS_SEARCH_REQUEST
    }),
    setClientsSearchRequestSorter: (value) => ({
        type: actionTypes.SET_CLIENTS_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setClientsSearchRequestPagination: (value) => ({
        type: actionTypes.SET_CLIENTS_SEARCH_REQUEST_PAGINATION,
        payload: value
    })
}
/*******************************************PROFILE REDUCER******************************************/
const clientManagementReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_CLIENTS:
            return {
                ...state,
                paginatedClients: action.payload
            };

        case actionTypes.SET_CLIENTS_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                clientsSearchRequest: {
                    ...state.clientsSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: action.payload != '' ? true : state.clientsSearchRequest.isFiltered
                }
            };

        case actionTypes.SET_INITIAL_CLIENTS_SEARCH_REQUEST:
            return {
                ...state,
                clientsSearchRequest: INITIAL_CLIENTS_SEARCH_REQUEST
            };

        case actionTypes.SET_CLIENTS_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                clientsSearchRequest: {
                    ...state.clientsSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_FILTERED_SITES_FOR_CLIENTS:
            return {
                ...state,
                clientsSearchRequest: {
                    ...state.clientsSearchRequest,
                    sites: action.payload.values,
                    isFiltered: (action.payload.values && action.payload.values.length) ? true : state.clientsSearchRequest.isFiltered
                }
            };

        case actionTypes.SET_CLIENTS_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                clientsSearchRequest: {
                    ...state.clientsSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.GET_PROFILE_DETAILS:
            return {
                ...state,
                userData: action.payload.values
            };

        case actionTypes.RESERVE_EMPLOYEE:

            const employee = {
                ...action.payload.values,
                key: state.reservedEmployee.length === 0 ? 1 : state.reservedEmployee.length + 1
            }
            return {
                ...state,
                reservedEmployee: [...state.reservedEmployee, employee]
            }

        case actionTypes.RESERVE_EMPLOYEES:

            const employees = action.payload.values.map((item, index) => {
                return {
                    ...item,
                    key: index
                };
            });

            return {
                ...state,
                reservedEmployee: employees
            }

        case actionTypes.DELETE_RESERVED_EMPLOYEE:
            const filteredEmployees = state.reservedEmployee.filter(item => item.key != action.payload.key);

            return {
                ...state,
                reservedEmployee: filteredEmployees
            }

        case actionTypes.SET_CLIENT_SITES:
            return {
                ...state,
                clientSites: action.payload.value
            }

        case actionTypes.CLEAR_EDITABLE:
            return {
                ...state,
                reservedEmployee: [],
                editingClient: [],
                editingStatus: false
            }

        case actionTypes.SET_EDITING_CLIENT:
            const client = state.paginatedClients.data.find(item => item.id === action.payload.id);

            return {
                ...state,
                editingClient: client,
                editingStatus: true
            }

        case actionTypes.SET_CLIENT_SITES_LABELS:
            return {
                ...state,
                clientSites: action.payload.values
            }

        default:
            return state;
    }
}

export default clientManagementReducer;