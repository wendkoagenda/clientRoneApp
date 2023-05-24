import { getWorkOrderStatus } from "../../constants/order-statuses";
import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";

/***************************************** INITIAL STATE ********************************************/
const INITIAL_WORK_ORDERS_SEARCH_REQUEST = {
    searchCriteria: '',
    sites: [],
    sortCriteria: 'dispatchRequest.project.name',
    isAscend: false,
    pageNumber: 1,
    pageSize: 100,
    isFiltered: false,
    isTemporaryClient: false,
    isTemporarySite: false,
    estimatedStartDateFrom: null,
    estimatedStartDateTo: null,
    workOrderStatusIds: []
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
const reducerName = "WORK_ORDERS_";
const actionTypes = {
    SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST: `${reducerName}SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST`,
    SET_PAGINATED_WORK_ORDERS: `${reducerName}SET_PAGINATED_WORK_ORDERS`,
    SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_CRITERIA`,
    SET_WORK_ORDERS_SEARCH_REQUEST_SORTER: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_SORTER`,
    SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_PAGINATION`,
    SET_WORK_ORDERS_SEARCH_REQUEST_STATUS_IDS: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_STATUS_IDS`,
    ASSIGN_OR_UPDATE_WORK_ORDER: `${reducerName}ASSIGN_OR_UPDATE_WORK_ORDER`,
    UNASSIGN_WORK_ORDER: `${reducerName}UNASSIGN_WORK_ORDER`,
    CONFIRM_WORK_ORDER: `${reducerName}CONFIRM_WORK_ORDER`,
    SEND_WORK_ORDERS_NOTIFICATION: `${reducerName}SEND_WORK_ORDERS_NOTIFICATION`,
    SET_WORK_ORDERS_SEARCH_REQUEST_DATE_RANGE: `${reducerName}SET_WORK_ORDERS_SEARCH_REQUEST_DATE_RANGE`,
    COMPLETE_WORK_ORDER: `${reducerName}COMPLETE_WORK_ORDER`,
    SET_TEMPORARY_CLIENT_SEARCH_REQUEST: `${reducerName}SET_TEMPORARY_CLIENT_SEARCH_REQUEST`,
    SET_TEMPORARY_SITE_SEARCH_REQUEST: `${reducerName}SET_TEMPORARY_SITE_SEARCH_REQUEST`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setPaginatedWorkOrders: (value) => ({
        type: actionTypes.SET_PAGINATED_WORK_ORDERS,
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
    }),
    setWorkOrderSearchRequestStatusIds: (value) => ({
        type: actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_STATUS_IDS,
        payload: value
    }),
    assignOrUpdateWorkOrder: (values) => ({
        type: actionTypes.ASSIGN_OR_UPDATE_WORK_ORDER,
        payload: { ...values }
    }),
    unassignWorkOrder: (values) => ({
        type: actionTypes.UNASSIGN_WORK_ORDER,
        payload: { ...values }
    }),
    confirmWorkOrder: (values) => ({
        type: actionTypes.CONFIRM_WORK_ORDER,
        payload: { ...values }
    }),
    sendWorkOrderNotification: (values) => ({
        type: actionTypes.SEND_WORK_ORDERS_NOTIFICATION,
        payload: { ...values }
    }),
    setWorkOrderSearchRequestDateRange: (value) => ({
        type: actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_DATE_RANGE,
        payload: value
    }),
    completeWorkOrder: (values) => ({
        type: actionTypes.COMPLETE_WORK_ORDER,
        payload: { ...values }
    }),
    setTemporaryClientSearchRequest: (value) => ({
        type: actionTypes.SET_TEMPORARY_CLIENT_SEARCH_REQUEST,
        payload: { value }
    }),
    setTemporarySiteSearchRequest: (value) => ({
        type: actionTypes.SET_TEMPORARY_SITE_SEARCH_REQUEST,
        payload: { value }
    })
}

/******************************************* REDUCER ************************************************/
const workOrderReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_WORK_ORDERS:
            return {
                ...state,
                paginatedWorkOrders: action.payload
            };

        case actionTypes.COMPLETE_WORK_ORDER:
            return {
                ...state,
                paginatedWorkOrders: {
                    ...state.paginatedWorkOrders,
                    data: state.paginatedWorkOrders.data.map(item => {
                        if (action.payload.workOrderId == item.workOrderId && action.payload.dispatchRequestId == item.dispatchRequestId) {
                            return {
                                ...item,
                                statusId: action.payload.statusId,
                                status: getWorkOrderStatus(action.payload.statusId),
                                uiStatusId: action.payload.uiStatusId
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.SEND_WORK_ORDERS_NOTIFICATION:
            return {
                ...state,
                paginatedWorkOrders: {
                    ...state.paginatedWorkOrders,
                    data: state.paginatedWorkOrders.data.map(item => {
                        if (action.payload.id == item.id) {
                            return {
                                ...item,
                                statusId: action.payload.statusId,
                                status: getWorkOrderStatus(action.payload.statusId),
                                uiStatusId: action.payload.uiStatusId
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.SET_TEMPORARY_SITE_SEARCH_REQUEST:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    isTemporarySite: action.payload.value,
                    isTemporaryClient: (action.payload.value && state.workOrdersSearchRequest.isTemporaryClient) && false,
                    isFiltered: action.payload.value && true
                }
            }

        case actionTypes.SET_TEMPORARY_CLIENT_SEARCH_REQUEST:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    isTemporaryClient: action.payload.value,
                    isTemporarySite: (action.payload.value && state.workOrdersSearchRequest.isTemporarySite) && false,
                    isFiltered: action.payload.value && true
                }
            }

        case actionTypes.CONFIRM_WORK_ORDER:
            return {
                ...state,
                paginatedWorkOrders: {
                    ...state.paginatedWorkOrders,
                    data: state.paginatedWorkOrders.data.map(item => {
                        if (action.payload.workOrderId == item.workOrderId && action.payload.dispatchRequestId == item.dispatchRequestId) {
                            return {
                                ...item,
                                isConfirmed: true,
                                uiStatusId: action.payload.uiStatusId
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.UNASSIGN_WORK_ORDER:
            return {
                ...state,
                paginatedWorkOrders: {
                    ...state.paginatedWorkOrders,
                    data: state.paginatedWorkOrders.data.map(item => {
                        if (action.payload.workOrderId == item.workOrderId && action.payload.dispatchRequestId == item.dispatchRequestId) {
                            return {
                                ...item,
                                startAt: "",
                                endAt: "",
                                statusId: action.payload.statusId,
                                status: getWorkOrderStatus(action.payload.statusId),
                                uiStatusId: action.payload.uiStatusId,
                                technicianId: 0,
                                technician: "",
                                isConfirmed: false
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.ASSIGN_OR_UPDATE_WORK_ORDER:
            return {
                ...state,
                paginatedWorkOrders: {
                    ...state.paginatedWorkOrders,
                    data: state.paginatedWorkOrders.data.map(item => {
                        if (action.payload.workOrderId == item.workOrderId && action.payload.dispatchRequestId == item.dispatchRequestId) {
                            return {
                                ...item,
                                startAt: action.payload.startAt,
                                endAt: action.payload.endAt,
                                statusId: action.payload.statusId,
                                status: getWorkOrderStatus(action.payload.statusId),
                                uiStatusId: action.payload.uiStatusId,
                                technicianId: action.payload.technicianId,
                                technician: action.payload.technicianFullName
                            }
                        } else {
                            return item;
                        }
                    })
                }
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

        case actionTypes.SET_INITIAL_WORK_ORDERS_SEARCH_REQUEST:
            return {
                ...state,
                workOrdersSearchRequest: INITIAL_WORK_ORDERS_SEARCH_REQUEST
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

        case actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_STATUS_IDS:
            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    workOrderStatusIds: action.payload,
                    isFiltered: action.payload && action.payload.length
                }
            }

        case actionTypes.SET_WORK_ORDERS_SEARCH_REQUEST_DATE_RANGE:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                workOrdersSearchRequest: {
                    ...state.workOrdersSearchRequest,
                    estimatedStartDateFrom: dateFrom,
                    estimatedStartDateTo: dateTo,
                    isFiltered: action.payload && action.payload.length
                }
            }

        default:
            return state;
    }
}

export default workOrderReducer;