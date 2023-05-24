import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";

/*****************************************INITIAL STATE********************************************/
const INITIAL_STATE = {
    journalList: [],
    actions: [],
    modules: [],
    searchCriteria: {
        email: '',
        sites: [],
        actions: [],
        modules: [],
        dateRangeFrom: null,
        dateRangeTo: null
    },
    pageNumber: 1,
    recordsCount: 1,
    pageSize: 200,
    mappedSortCriterias: [
        { dataIndex: 'site', name: 'Site' },
        { dataIndex: 'createdAt', name: 'CreatedAt' },
        { dataIndex: 'module', name: 'SystemModule.Name' },
        { dataIndex: 'action', name: 'UserAction.Name' }
    ]
};
/*****************************************ACTION TYPES*********************************************/
const actionTypes = {
    SET_MODULES: 'SET_MODULES',
    SET_ACTIONS: 'SET_ACTIONS',
    SET_JOURNAL_LIST: 'SET_JOURNAL_LIST',
    SET_SEARCH_CRITERIA: 'SET_SEARCH_CRITERIA',
    SET_SEARCH_CRITERIA_VALUE: 'SET_SEARCH_CRITERIA_VALUE',
    SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
    SET_PAGE_SIZE: 'SET_PAGE_SIZE',
    SET_DATE_RANGE_FILTER: 'ACTIVITY_JOURNAL_SET_DATE_RANGE_FILTER'
};
/********************************************ACTIONS************************************************/
export const actions = {
    setModules: (values) => ({
        type: actionTypes.SET_MODULES,
        payload: { values }
    }),
    setActions: (values) => ({
        type: actionTypes.SET_ACTIONS,
        payload: { values }
    }),
    setCurrentPage: (value) => ({
        type: actionTypes.SET_CURRENT_PAGE,
        payload: { value }
    }),
    setPageSize: (value) => ({
        type: actionTypes.SET_PAGE_SIZE,
        payload: { value }
    }),
    setJournalList: (values) => ({
        type: actionTypes.SET_JOURNAL_LIST,
        payload: { values }
    }),
    setSearchCriteria: (values) => ({
        type: actionTypes.SET_SEARCH_CRITERIA,
        payload: { values }
    }),
    setSearchCriteriaValue: (values, fieldName) => ({
        type: actionTypes.SET_SEARCH_CRITERIA_VALUE,
        payload: { values, fieldName }
    }),
    setDateRangeFilter: (value) => ({
        type: actionTypes.SET_DATE_RANGE_FILTER,
        payload: value
    })
}
/*******************************************PROFILE REDUCER******************************************/
const journalReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_MODULES:
            return {
                ...state,
                modules: action.payload.values
            };

        case actionTypes.SET_ACTIONS:
            return {
                ...state,
                actions: action.payload.values
            };

        case actionTypes.SET_CURRENT_PAGE:
            return {
                ...state,
                pageNumber: action.payload.value
            };

        case actionTypes.SET_PAGE_SIZE:
            return {
                ...state,
                pageSize: action.payload.value
            };

        case actionTypes.SET_JOURNAL_LIST:
            return {
                ...state,
                journalList: action.payload.values.data,
                recordsCount: action.payload.values.recordsCount
            }

        case actionTypes.SET_SEARCH_CRITERIA:
            return {
                ...state,
                searchCriteria: { ...state.searchCriteria, ...action.payload.values }
            }

        case actionTypes.SET_SEARCH_CRITERIA_VALUE:
            return {
                ...state,
                searchCriteria: {
                    ...state.searchCriteria,
                    [action.payload.fieldName]: action.payload.values
                }
            }

        case actionTypes.SET_DATE_RANGE_FILTER:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                searchCriteria: {
                    ...state.searchCriteria,
                    dateRangeFrom: dateFrom,
                    dateRangeTo: dateTo
                }
            }

        default:
            return state;
    }
}

export default journalReducer;