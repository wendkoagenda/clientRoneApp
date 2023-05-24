/*****************************************INITIAL STATE********************************************/
const INITIAL_USERS_SEARCH_REQUEST = {
    sites: [],
    roles: [],
    searchCriteria: '',
    sortCriteria: 'userName',
    isAscend: true,
    pageNumber: 1,
    pageSize: 100,
    isFiltered: false
};

const INITIAL_STATE = {
    filteredSites: [],
    filteredRoles: [],
    sites: [],
    roles: [],
    projects: [],
    filteredUsers: [],
    isLoading: false,
    isFiltered: false,
    currentUser: [],
    usersSearchRequest: INITIAL_USERS_SEARCH_REQUEST,
    paginatedUsers: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};
/*****************************************ACTION TYPES*********************************************/
const actionTypes = {
    UPDATE_USERS: 'UPDATE_USERS',
    EDIT_USER: 'EDIT_USER',
    CREATE_NEW_USER: 'CREATE_NEW_USER',
    START_LOADING: 'START_LOADING',
    END_LOADING: 'END_LOADING',
    SET_SORTED_USERS: 'SET_SORTED_USERS',
    SET_FILTERING: 'SET_FILTERING',
    DISABLE_FILTERING: 'DISABLE_FILTERING',
    SET_SITES: 'SET_SITES',
    SET_ROLES: 'SET_ROLES',
    SET_PROJECTS: 'SET_PROJECTS',
    SET_CURRENT_USER: 'SET_CURRENT_USER',
    SET_FILTERED_SITES: 'SET_FILTERED_SITES',
    SET_FILTERED_ROLES: 'SET_FILTERED_ROLES',
    SET_FILTERED_ROLES_FOR_USERS: 'SET_FILTERED_ROLES_FOR_USERS',
    SET_FILTERED_SITES_FOR_USERS: 'SET_FILTERED_SITES_FOR_USERS',
    SET_INITIAL_USERS_SEARCH_REQUEST: 'SET_INITIAL_USERS_SEARCH_REQUEST',
    SET_PAGINATED_USERS: 'SET_PAGINATED_USERS',
    SET_USERS_SEARCH_REQUEST_CRITERIA: 'SET_USERS_SEARCH_REQUEST_CRITERIA',
    SET_USERS_SEARCH_REQUEST_SORTER: 'SET_USERS_SEARCH_REQUEST_SORTER',
    SET_USERS_SEARCH_REQUEST_PAGINATION: 'SET_USERS_SEARCH_REQUEST_PAGINATION',
};
/********************************************ACTIONS************************************************/
export const actions = {
    updateUsers: () => ({
        type: actionTypes.UPDATE_USERS
    }),

    editUser: (index, value) => ({
        type: actionTypes.EDIT_USER,
        payload: { index, value }
    }),

    createNewUser: (value) => ({
        type: actionTypes.CREATE_NEW_USER,
        payload: { value }
    }),

    startLoading: () => ({
        type: actionTypes.START_LOADING
    }),

    endLoading: () => ({
        type: actionTypes.END_LOADING
    }),

    setFiltering: () => ({
        type: actionTypes.SET_FILTERING
    }),

    disableFiltering: () => ({
        type: actionTypes.SET_FILTERING
    }),

    setSites: (value) => ({
        type: actionTypes.SET_SITES,
        payload: { value }
    }),
    setRoles: (value) => ({
        type: actionTypes.SET_ROLES,
        payload: { value }
    }),
    setCurrentUser: (value) => ({
        type: actionTypes.SET_CURRENT_USER,
        payload: { value }
    }),
    setFilteredSites: (values) => ({
        type: actionTypes.SET_FILTERED_SITES,
        payload: { values }
    }),
    setFilteredRoles: (values) => ({
        type: actionTypes.SET_FILTERED_ROLES,
        payload: { values }
    }),
    setFilteredSitesForUsers: (values) => ({
        type: actionTypes.SET_FILTERED_SITES_FOR_USERS,
        payload: values
    }),
    setFilteredRolesForUsers: (values) => ({
        type: actionTypes.SET_FILTERED_ROLES_FOR_USERS,
        payload: values
    }),
    setPaginatedUsers: (value) => ({
        type: actionTypes.SET_PAGINATED_USERS,
        payload: value
    }),
    setUsersSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_USERS_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialUsersSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_USERS_SEARCH_REQUEST
    }),
    setUsersSearchRequestSorter: (value) => ({
        type: actionTypes.SET_USERS_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setUsersSearchRequestPagination: (value) => ({
        type: actionTypes.SET_USERS_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setFilteredUsers: (value, searchCriteria) => ({
        type: actionTypes.SET_SORTED_USERS,
        payload: { value, searchCriteria }
    }),
}
/**************************************USER MANAGEMENT REDUCER**************************************/
const userManagementReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.UPDATE_USERS:
            return {
                ...state,
                paginatedUsers: state.paginatedUsers.data
            };

        case actionTypes.ASSIGN_PROJECT:
            return {
                ...state,
                projects: [state.projects, action.payload]
            };

        case actionTypes.EDIT_USER:
            return {
                ...state,
                paginatedUsers: []
            }

        case actionTypes.CREATE_NEW_USER:
            return {
                ...state,
                paginatedUsers: [...state.paginatedUsers.data, action.payload.value]
            }

        case actionTypes.START_LOADING:
            return {
                ...state,
                isLoading: true
            }

        case actionTypes.END_LOADING:
            return {
                ...state,
                isLoading: false
            }

        case actionTypes.SET_SORTED_USERS:
            let filteringStatus = !(action.payload.searchCriteria == "");
            return {
                ...state,
                filteredUsers: action.payload.value,
                searchCriteria: action.payload.searchCriteria,
                isFiltering: filteringStatus
            }

        case actionTypes.SET_FILTERING:
            return {
                ...state,
                isFiltering: true
            }

        case actionTypes.DISABLE_FILTERING:
            return {
                ...state,
                isFiltering: false
            }

        case actionTypes.SET_SITES:
            return {
                ...state,
                sites: action.payload.value
            }

        case actionTypes.SET_ROLES:
            return {
                ...state,
                roles: action.payload.value
            }

        case actionTypes.SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload.value
            }

        case actionTypes.SET_FILTERED_SITES:
            const filteredSites = state.filteredSites.filter(item => item != "Rone" && item != "JRB");
            return {
                ...state,
                usersSearchRequest: {
                    ...state.usersSearchRequest,
                    sites: filteredSites,
                    isFiltered: filteredSites.length ? true : state.usersSearchRequest.isFiltered
                }
            }

        case actionTypes.SET_FILTERED_ROLES:
            return {
                ...state,
                usersSearchRequest: {
                    ...state.usersSearchRequest,
                    roles: state.filteredRoles,
                    isFiltered: state.filteredRoles.length ? true : state.usersSearchRequest.isFiltered
                }
            }

        case actionTypes.SET_FILTERED_ROLES_FOR_USERS:
            return {
                ...state,
                filteredRoles: action.payload
            }

        case actionTypes.SET_FILTERED_SITES_FOR_USERS:
            return {
                ...state,
                filteredSites: action.payload
            }

        case actionTypes.SET_PAGINATED_USERS:
            return {
                ...state,
                paginatedUsers: action.payload
            }

        case actionTypes.SET_USERS_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                usersSearchRequest: {
                    ...state.usersSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: action.payload != '' ? true : state.usersSearchRequest.isFiltered
                }
            };

        case actionTypes.SET_INITIAL_USERS_SEARCH_REQUEST:
            return {
                ...state,
                usersSearchRequest: INITIAL_USERS_SEARCH_REQUEST
            };

        case actionTypes.SET_USERS_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                usersSearchRequest: {
                    ...state.usersSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            }

        case actionTypes.SET_USERS_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                usersSearchRequest: {
                    ...state.usersSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            }

        default:
            return state;
    }
}

export default userManagementReducer;