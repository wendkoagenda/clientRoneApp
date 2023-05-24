/***************************************** INITIAL STATE ********************************************/
const INITIAL_WORK_ORDERS_SEARCH_REQUEST = {
    searchCriteria: "",
    sortCriteria: 'isPickupNeeded',
    isAscend: false,
    pageNumber: 1,
    pageSize: 200,
    isFiltered: false
};

const INITIAL_STATE = {
    workOrdersSearchRequest: INITIAL_WORK_ORDERS_SEARCH_REQUEST,
    paginatedWorkOrders: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "WORK_ORDERS_MANAGEMENT_";
const actionTypes = {
    SET_WORK_ORDERS: `${reducerName}SET_WORK_ORDERS`,
    SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA`,
    SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST: `${reducerName}SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST`,
    SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION`,
    SET_WORK_ORDERS_SEARCH_REQUEST_SORTER: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_SORTER`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setWorkOrders: (value) => ({
        type: actionTypes.SET_WORK_ORDERS,
        payload: value
    }),
    setWorkOrdersSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialWorkOrdersSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST
    }),
    setWorkOrdersSearchRequestSorter: (value) => ({
        type: actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setWorkOrdersSearchRequestPagination: (value) => ({
        type: actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION,
        payload: value
    })
}

/******************************************* REDUCER ************************************************/
const workOrdersManagementReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_WORK_ORDERS:
            return {
                ...state,
                paginatedWorkOrders: action.payload
            };

        case actionTypes.SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST:
            return {
                ...state,
                workOrdersSearchRequest: INITIAL_WORK_ORDERS_SEARCH_REQUEST
            }

        case actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        default:
            return state;
    }
}

export default workOrdersManagementReducer;