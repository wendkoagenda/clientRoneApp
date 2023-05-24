import { strings } from "../../constants";

/***************************************** INITIAL STATE ********************************************/
const INITIAL_BUDGET_SEARCH_REQUEST = {
    searchCriteria: '',
    category: null
};

const INITIAL_STATE = {
    workOrders: [],
    budgetSearchRequest: INITIAL_BUDGET_SEARCH_REQUEST,
    categoriesOptions: []
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "BUDGET_SHEET_";
const actionTypes = {
    SET_WORK_ORDERS: `${reducerName}SET_WORK_ORDERS`,
    SET_CATEGORY: `${reducerName}SET_CATEGORY`,
    SET_BUDGET_SEARCH_CRITERIA: `${reducerName}SET_BUDGET_SEARCH_CRITERIA`,
    SET_CATEGORIES_OPTIONS: `${reducerName}SET_CATEGORIES_OPTIONS`,
    UPDATE_EDITED_ROW: `${reducerName}UPDATE_EDITED_ROW`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setWorkOrders: (values) => ({
        type: actionTypes.SET_WORK_ORDERS,
        payload: { values }
    }),
    setCategory: (value) => ({
        type: actionTypes.SET_CATEGORY,
        payload: { value }
    }),
    setBudgetSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_BUDGET_SEARCH_CRITERIA,
        payload: { value }
    }),
    setCategoriesOptions: (values) => ({
        type: actionTypes.SET_CATEGORIES_OPTIONS,
        payload: { values }
    }),
    updateEditedRow: (values) => ({
        type: actionTypes.UPDATE_EDITED_ROW,
        payload: { values }
    })
}

/******************************************* REDUCER ************************************************/
const budgetSheetReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_WORK_ORDERS:
            return {
                ...state,
                workOrders: action.payload.values
            }

        case actionTypes.SET_CATEGORY:
            return {
                ...state,
                budgetSearchRequest: {
                    ...state.budgetSearchRequest,
                    category: action.payload.value === strings.COMMON.ALL_CATEGORIES ? null : action.payload.value
                }
            }

        case actionTypes.SET_BUDGET_SEARCH_CRITERIA:
            return {
                ...state,
                budgetSearchRequest: {
                    ...state.budgetSearchRequest,
                    searchCriteria: action.payload.value
                }
            }

        case actionTypes.SET_CATEGORIES_OPTIONS:
            return {
                ...state,
                categoriesOptions: action.payload.values
            }

        case actionTypes.UPDATE_EDITED_ROW:
            return {
                ...state,
                workOrders: state.workOrders.map(item => {
                    return item.workOrderId === action.payload.values.workOrderId ? {
                        ...item,
                        ...action.payload.values
                    } : item;
                })
            }

        default:
            return state;
    }
}

export default budgetSheetReducer;