import moment from "moment-timezone";
import { invoiceManageStatuses } from "../../constants/invoice-manage-statuses";
import { invoicePageViewModes } from "../../constants/invoice-manage-view-modes";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";

/***************************************** INITIAL STATE ********************************************/
const INITIAL_INVOICES_SEARCH_REQUEST = {
    //invoiceSchedulerStatuses: [invoiceManageStatuses.Planned, invoiceManageStatuses.Postponed],
    invoiceSchedulerStatuses: [invoiceManageStatuses.Planned, invoiceManageStatuses.Sent],
    sortCriteria: 'CreateAt',
    isAscend: false,
    pageNumber: 1,
    pageSize: 200,
    isFiltered: false,
    dateFrom: null,
    dateTo: null
};

const INITIAL_STATE = {
    //invoiceManageViewMode: invoicePageViewModes.Queue,
    invoiceManageViewMode: invoicePageViewModes.History,
    invoicesSearchRequest: INITIAL_INVOICES_SEARCH_REQUEST,
    paginatedInvoices: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "INVOICE_JOURNAL_";
const actionTypes = {
    SET_INITIAL_INVOICES_SEARCH_REQUEST: `${reducerName}SET_INITIAL_INVOICES_SEARCH_REQUEST`,
    SET_PAGINATED_INVOICES: `${reducerName}SET_PAGINATED_INVOICES`,
    SET_INVOICES_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_INVOICES_SEARCH_REQUEST_CRITERIA`,
    SET_INVOICES_SEARCH_REQUEST_PARAMETERS: `${reducerName}SET_INVOICES_SEARCH_REQUEST_PARAMETERS`,
    SET_INVOICES_SEARCH_REQUEST_DATE_RANGE: `${reducerName}SET_INVOICES_SEARCH_REQUEST_DATE_RANGE`,
    SET_INVOICE_MANAGE_VIEW_MODE: `${reducerName}SET_INVOICE_MANAGE_VIEW_MODE`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setPaginatedInvoices: (value) => ({
        type: actionTypes.SET_PAGINATED_INVOICES,
        payload: value
    }),
    setInvoiceSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_INVOICES_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialInvoiceSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_INVOICES_SEARCH_REQUEST
    }),
    setInvoiceSearchParameters: (value) => ({
        type: actionTypes.SET_INVOICES_SEARCH_REQUEST_PARAMETERS,
        payload: value
    }),
    setInvoicesSearchRequestDateRange: (value) => ({
        type: actionTypes.SET_INVOICES_SEARCH_REQUEST_DATE_RANGE,
        payload: value
    }),
    setInvoiceManageViewMode: (value) => ({
        type: actionTypes.SET_INVOICE_MANAGE_VIEW_MODE,
        payload: value
    })
}

/******************************************* REDUCER ************************************************/
const invoicesJournalReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_INVOICES:
            return {
                ...state,
                paginatedInvoices: action.payload
            };

        case actionTypes.SET_INVOICES_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                invoicesSearchRequest: {
                    ...state.invoicesSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_INITIAL_INVOICES_SEARCH_REQUEST:
            return {
                ...state,
                invoicesSearchRequest: INITIAL_INVOICES_SEARCH_REQUEST,
                //invoiceManageViewMode: invoicePageViewModes.Queue
                invoiceManageViewMode: invoicePageViewModes.History
            };

        case actionTypes.SET_INVOICES_SEARCH_REQUEST_PARAMETERS:
            return {
                ...state,
                invoicesSearchRequest: {
                    ...state.invoicesSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_INVOICES_SEARCH_REQUEST_DATE_RANGE:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                invoicesSearchRequest: {
                    ...state.invoicesSearchRequest,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    isFiltered: action.payload && action.payload.length
                }
            }

        case actionTypes.SET_INVOICE_MANAGE_VIEW_MODE:
            return {
                ...state,
                invoiceManageViewMode: action.payload,
                invoicesSearchRequest: {
                    ...state.invoicesSearchRequest,
                    invoiceSchedulerStatuses: action.payload == invoicePageViewModes.Queue
                        ? [invoiceManageStatuses.Planned, invoiceManageStatuses.Postponed]
                        : [invoiceManageStatuses.Sent]
                }
            }

        default:
            return state;
    }
}

export default invoicesJournalReducer;