import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";
import { reportTypesIds } from '../../constants';
import { reportTypes, reportTypesGroup } from "../../constants/report-types";

/***************************************** INITIAL STATE ********************************************/
const INITIAL_BREAK_LIST_SEARCH_REQUEST = {
    searchCriteria: '',
    sortCriteria: 'barcode.number',
    isAscend: false,
    pageNumber: 1,
    pageSize: 100,
    isFiltered: false,
    dateFrom: null,
    dateTo: null,
    searchDate: null,
    sitesIds: []
};

const INITIAL_STATE = {
    filteredSites: [],
    reportTypeGroup: reportTypesGroup.CONCRETE,
    reportTypeId: reportTypesIds.CONCRETE_CYLINDERS,
    breakListSearchRequest: INITIAL_BREAK_LIST_SEARCH_REQUEST,
    paginatedBreakList: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    },
    breakListWithoutPagination: [],
    filteredSitesByDate: []
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "BREAK_LIST_";
const actionTypes = {
    SET_INITIAL_BREAK_LIST_SEARCH_REQUEST: `${reducerName}SET_INITIAL_BREAK_LIST_SEARCH_REQUEST`,
    SET_PAGINATED_BREAK_LIST: `${reducerName}SET_PAGINATED_BREAK_LIST`,
    SET_BREAK_LIST_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_BREAK_LIST_SEARCH_REQUEST_CRITERIA`,
    SET_BREAK_LIST_SEARCH_REQUEST_SORTER: `${reducerName}SET_BREAK_LIST_SEARCH_REQUEST_SORTER`,
    SET_BREAK_LIST_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_BREAK_LIST_SEARCH_REQUEST_PAGINATION`,
    SET_BREAK_LIST_SEARCH_REQUEST_DATE_RANGE: `${reducerName}SET_BREAK_LIST_SEARCH_REQUEST_DATE_RANGE`,
    UPDATE_TESTED_BY_PERSON: `${reducerName}UPDATE_TESTED_BY_PERSON`,
    UPDATE_SPEC_INFO: `${reducerName}UPDATE_SPEC_INFO`,
    SET_REPORT_TYPE_ID: `${reducerName}SET_REPORT_TYPE_ID`,
    PREPARE_FILTERED_SITES: `${reducerName}PROJECTS_PREPARE_FILTERED_SITES`,
    SET_FILTERED_SITES: `${reducerName}SET_FILTERED_SITES`,
    SET_BREAK_LIST_WITHOUT_PAGINATION: `${reducerName}SET_BREAK_LIST_WITHOUT_PAGINATION`,
    UPDATE_SPEC_INFO_WITHOUT_PAGINATION: `${reducerName}UPDATE_SPEC_INFO_WITHOUT_PAGINATION`,
    SET_FILTERED_SITES_BY_DATE: `${reducerName}SET_FILTERED_SITES_BY_DATE`,
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setPaginatedBreakList: (value) => ({
        type: actionTypes.SET_PAGINATED_BREAK_LIST,
        payload: value
    }),
    setBreakListSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialBreakListSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_BREAK_LIST_SEARCH_REQUEST
    }),
    setBreakListSearchRequestSorter: (value) => ({
        type: actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setBreakListSearchRequestPagination: (value) => ({
        type: actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setBreakListSearchRequestDateRange: (value) => ({
        type: actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_DATE_RANGE,
        payload: value
    }),
    updateTestedBy: (id, value) => ({
        type: actionTypes.UPDATE_TESTED_BY_PERSON,
        payload: { id, value }
    }),
    updateSpecInfo: (id, values) => ({
        type: actionTypes.UPDATE_SPEC_INFO,
        payload: { id, values }
    }),
    setReportTypeId: (id) => ({
        type: actionTypes.SET_REPORT_TYPE_ID,
        payload: { id }
    }),
    setPreparedFilteredSites: (value) => ({
        type: actionTypes.PREPARE_FILTERED_SITES,
        payload: value
    }),
    setFilteredSites: () => ({
        type: actionTypes.SET_FILTERED_SITES
    }),
    setBreakListWithoutPagination: (value) => ({
        type: actionTypes.SET_BREAK_LIST_WITHOUT_PAGINATION,
        payload: value
    }),
    updateSpecInfoWithoutPagination: (id, values) => ({
        type: actionTypes.UPDATE_SPEC_INFO_WITHOUT_PAGINATION,
        payload: { id, values }
    }),
    setFilteredSitesByDate: (value) => ({
        type: actionTypes.SET_FILTERED_SITES_BY_DATE,
        payload: value
    })
}

/******************************************* REDUCER ************************************************/
const breakListReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_BREAK_LIST:
            return {
                ...state,
                paginatedBreakList: action.payload
            };

        case actionTypes.UPDATE_TESTED_BY_PERSON:
            return {
                ...state,
                paginatedBreakList: {
                    ...state.paginatedBreakList,
                    data: state.paginatedBreakList.data.map(item => {
                        if (item.breakListItemId == action.payload.id) {
                            return {
                                ...item,
                                testedBy: action.payload.value
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.SET_REPORT_TYPE_ID:
            return {
                ...state,
                reportTypeId: action.payload.id,
                breakListSearchRequest: INITIAL_BREAK_LIST_SEARCH_REQUEST,
                reportTypeGroup: reportTypes.find(item => item.reportTypeId === action.payload.id).reportTypeGroup
            }

        case actionTypes.UPDATE_SPEC_INFO:
            return {
                ...state,
                paginatedBreakList: {
                    ...state.paginatedBreakList,
                    data: state.paginatedBreakList.data.map(item => {
                        if (item.breakListItemId == action.payload.id) {
                            return {
                                ...item,
                                ...action.payload.values,
                                fractureType: action.payload.values.fracture
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                breakListSearchRequest: {
                    ...state.breakListSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_INITIAL_BREAK_LIST_SEARCH_REQUEST:
            return {
                ...state,
                filteredSites: [],
                filteredSitesByDate: [],
                breakListSearchRequest: INITIAL_BREAK_LIST_SEARCH_REQUEST
            };

        case actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                breakListSearchRequest: {
                    ...state.breakListSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                breakListSearchRequest: {
                    ...state.breakListSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_BREAK_LIST_SEARCH_REQUEST_DATE_RANGE:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                breakListSearchRequest: {
                    ...state.breakListSearchRequest,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    isFiltered: action.payload && action.payload.length
                }
            }

        case actionTypes.PREPARE_FILTERED_SITES:
            return {
                ...state,
                filteredSites: action.payload
            }

        case actionTypes.SET_FILTERED_SITES:
            const filteredSites = state.filteredSites.filter(item => item != "Rone" && item != "JRB");

            return {
                ...state,
                breakListSearchRequest: {
                    ...state.breakListSearchRequest,
                    sitesIds: filteredSites,
                    isFiltered: filteredSites.length ? true : state.breakListSearchRequest.isFiltered
                }
            }

        case actionTypes.SET_BREAK_LIST_WITHOUT_PAGINATION:
            return {
                ...state,
                filteredSites: [],
                filteredSitesByDate: state.filteredSitesByDate,
                breakListWithoutPagination: action.payload
            };

        case actionTypes.UPDATE_SPEC_INFO_WITHOUT_PAGINATION:
            return {
                ...state,
                breakListWithoutPagination: state.breakListWithoutPagination.map(item => {
                    if (item.breakListItemId == action.payload.id) {
                        return {
                            ...item,
                            ...action.payload.values,
                            fractureType: action.payload.values.fracture
                        }
                    } else {
                        return item;
                    }
                })
            };

        case actionTypes.SET_FILTERED_SITES_BY_DATE:
            return {
                ...state,
                filteredSites: [],
                filteredSitesByDate: action.payload
            };

        default:
            return state;
    }
}

export default breakListReducer;