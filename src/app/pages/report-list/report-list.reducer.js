import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";
/***************************************** INITIAL STATE ********************************************/
const INITIAL_REPORT_LIST_SEARCH_REQUEST = {
    searchCriteria: undefined,
    sortCriteria: undefined,
    isAscend: false,
    isApproved: false,
    pageNumber: 1,
    pageSize: 100,
    isFiltered: false,
    invoiceStatusIds: [],
    createdAtFrom: undefined,
    createdAtTo: undefined,
};

const INITIAL_STATE = {
    reportListSearchRequest: INITIAL_REPORT_LIST_SEARCH_REQUEST,
    paginatedReportList: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "REPORT_LIST_";
const actionTypes = {
    SET_INITIAL_REPORT_LIST_SEARCH_REQUEST: `${reducerName}SET_INITIAL_REPORT_LIST_SEARCH_REQUEST`,
    SET_PAGINATED_REPORT_LIST: `${reducerName}SET_PAGINATED_REPORT_LIST`,
    SET_REPORT_LIST_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_REPORT_LIST_SEARCH_REQUEST_CRITERIA`,
    SET_REPORT_LIST_SEARCH_REQUEST_SORTER: `${reducerName}SET_REPORT_LIST_SEARCH_REQUEST_SORTER`,
    SET_REPORT_LIST_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_REPORT_LIST_SEARCH_REQUEST_PAGINATION`,
    SET_REPORT_LIST_SEARCH_REQUEST_DATE_RANGE: `${reducerName}SET_REPORT_LIST_SEARCH_REQUEST_DATE_RANGE`,
    SET_REPORT_LIST_INVOICE_STATUS_REQUEST: `${reducerName}SET_REPORT_LIST_INVOICE_STATUS_REQUEST`,
    SET_REPORT_LIST_APPROVED_REQUEST: `${reducerName}SET_REPORT_LIST_APPROVED_REQUEST`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setPaginatedReportList: (value) => ({
        type: actionTypes.SET_PAGINATED_REPORT_LIST,
        payload: value
    }),
    setReportListInvoiceStatusRequest: (values) => ({
        type: actionTypes.SET_REPORT_LIST_INVOICE_STATUS_REQUEST,
        payload: values
    }),
    setReportListSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialReportListSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_REPORT_LIST_SEARCH_REQUEST
    }),
    setReportListSearchRequestSorter: (value) => ({
        type: actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setReportListSearchRequestPagination: (value) => ({
        type: actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setReportListSearchRequestDateRange: (value) => ({
        type: actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_DATE_RANGE,
        payload: value
    }),
    setReportsSearchRequestApproved: (value) => ({
        type: actionTypes.SET_REPORT_LIST_APPROVED_REQUEST,
        payload: value
    })
}

/******************************************* REDUCER ************************************************/
const reportListReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_REPORT_LIST:
            return {
                ...state,
                paginatedReportList: {
                    ...action.payload,
                    data: action.payload.data.map(item => {
                        return {
                            ...item,
                            dispatchRequestWorkOrder: {
                                ...item.dispatchRequestWorkOrder,
                                workOrderSection: item?.dispatchRequestWorkOrder?.workOrderSection.includes(':') ? /:(.+)/.exec(item.dispatchRequestWorkOrder.workOrderSection)[1] : item.dispatchRequestWorkOrder.workOrderSection
                            }
                        }
                    })
                }
            };

        case actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_REPORT_LIST_APPROVED_REQUEST:
            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    isApproved: !state.reportListSearchRequest.isApproved
                }
            }

        case actionTypes.SET_REPORT_LIST_INVOICE_STATUS_REQUEST:
            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    isFiltered: !!action.payload,
                    invoiceStatusIds: action.payload
                }
            }

        case actionTypes.SET_INITIAL_REPORT_LIST_SEARCH_REQUEST:
            return {
                ...state,
                filteredSites: [],
                reportListSearchRequest: INITIAL_REPORT_LIST_SEARCH_REQUEST
            };

        case actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_REPORT_LIST_SEARCH_REQUEST_DATE_RANGE:
            let createdAtFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let createdAtTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                reportListSearchRequest: {
                    ...state.reportListSearchRequest,
                    createdAtFrom: createdAtFrom,
                    createdAtTo: createdAtTo,
                    isFiltered: action.payload && action.payload.length
                }
            }

        default:
            return state;
    }
}

export default reportListReducer;