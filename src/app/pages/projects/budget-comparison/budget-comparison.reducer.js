import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../../helpers/date-time-helper";;

/***************************************** INITIAL STATE ********************************************/
const INITIAL_BUDGET_COMPARISON_REQUEST = {
    dateFrom: undefined,
    dateTo: undefined,
    projectId: undefined,
    preparedBy: undefined
};

const INITIAL_STATE = {
    budgetComparisonSearchRequest: INITIAL_BUDGET_COMPARISON_REQUEST,
    budgetComparison: {}
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "BUDGET_COMPARISON_";
const actionTypes = {
    SET_INITIAL_BUDGET_COMPARISON_REQUEST: `${reducerName}SET_INITIAL_BUDGET_COMPARISON_REQUEST`,
    SET_BUDGET_COMPARISON_REQUEST_DATE_RANGE: `${reducerName}SET_BUDGET_COMPARISON_REQUEST_DATE_RANGE`,
    SET_BUDGET_COMPARISON_MODEL: `${reducerName}SET_BUDGET_COMPARISON_MODEL`,
    SET_PROJECT_ID: `${reducerName}SET_PROJECT_ID`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setInitialBudgetComparisonRequest: () => ({
        type: actionTypes.SET_INITIAL_BUDGET_COMPARISON_REQUEST
    }),
    setBudgetComparisonRequestDateRange: (value) => ({
        type: actionTypes.SET_BUDGET_COMPARISON_REQUEST_DATE_RANGE,
        payload: value
    }),
    setBudgetComparisonModel: value => ({
        type: actionTypes.SET_BUDGET_COMPARISON_MODEL,
        payload: { value }
    }),
    setProjectId: value => ({
        type: actionTypes.SET_PROJECT_ID,
        payload: { value }
    })
}

/******************************************* REDUCER ************************************************/
const budgetComparisonReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
    
        case actionTypes.SET_INITIAL_BUDGET_COMPARISON_REQUEST:
            return {
                ...state,
                budgetComparisonSearchRequest: INITIAL_BUDGET_COMPARISON_REQUEST,
                budgetComparison: {}
            }

        case actionTypes.SET_BUDGET_COMPARISON_MODEL:
            return {
                ...state,
                budgetComparison: action.payload.value
            }

        case actionTypes.SET_PROJECT_ID:
            return {
                ...state,
                budgetComparisonSearchRequest: {
                    ...state.budgetComparisonSearchRequest,
                    projectId: action.payload.value
                }
            }

        case actionTypes.SET_BUDGET_COMPARISON_REQUEST_DATE_RANGE:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                budgetComparisonSearchRequest: {
                    ...state.budgetComparisonSearchRequest,
                    dateFrom: dateFrom,
                    dateTo: dateTo
                }
            }

        default:
            return state;
    }
}

export default budgetComparisonReducer;