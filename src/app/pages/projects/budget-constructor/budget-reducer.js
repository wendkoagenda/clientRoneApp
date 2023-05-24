import { strings } from "../../../constants";
import { invoiceExtraMetricDescription } from "../../../constants/invoice-order-statuses";
import { levelMapping } from "../../../constants/levels";

/***************************************** INITIAL STATE ********************************************/
const INITIAL_BUDGET_SEARCH_REQUEST = {
    searchCriteria: '',
    category: null
};

const INITIAL_STATE = {
    workOrders: [],
    level: null,
    budgetSearchRequest: INITIAL_BUDGET_SEARCH_REQUEST,
    totalBudget: 0,
    categoriesOptions: [],
    assignedWorkOrders: [],
    budgetAvailable: false
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "BUDGET_";
const actionTypes = {
    SET_WORK_ORDERS: `${reducerName}SET_WORK_ORDERS`,
    ASSIGN_WORK_ORDER: `${reducerName}ASSIGN_WORK_ORDER`,
    SAVE_NEW_DATA: `${reducerName}SAVE_NEW_DATA`,
    REMOVE_ASSIGNED_ORDER: `${reducerName}REMOVE_ASSIGNED_ORDER`,
    SET_LEVEL: `${reducerName}SET_LEVEL`,
    SET_CATEGORY: `${reducerName}SET_CATEGORY`,
    SET_BUDGET_SEARCH_CRITERIA: `${reducerName}SET_BUDGET_SEARCH_CRITERIA`,
    SET_CATEGORIES_OPTIONS: `${reducerName}SET_CATEGORIES_OPTIONS`,
    SET_BUDGET_ITEMS: `${reducerName}SET_BUDGET_ITEMS`,
    ADD_EXTRA_METRIC: `${reducerName}ADD_EXTRA_METRIC`,
    CLEAR_BUDGET_SETUP: `${reducerName}CLEAR_BUDGET_SETUP`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setWorkOrders: (values) => ({
        type: actionTypes.SET_WORK_ORDERS,
        payload: { values }
    }),
    assignWorkOrder: (value) => ({
        type: actionTypes.ASSIGN_WORK_ORDER,
        payload: { value }
    }),
    saveNewData: (values) => ({
        type: actionTypes.SAVE_NEW_DATA,
        payload: { values }
    }),
    removeAssignedOrder: (id) => ({
        type: actionTypes.REMOVE_ASSIGNED_ORDER,
        payload: { id }
    }),
    setLevel: (value) => ({
        type: actionTypes.SET_LEVEL,
        payload: { value }
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
    setBudgetItems: (value) => ({
        type: actionTypes.SET_BUDGET_ITEMS,
        payload: value
    }),
    addExtraMetric: value => ({
        type: actionTypes.ADD_EXTRA_METRIC,
        payload: value
    }),
    clearBudgetSetup: () => ({
        type: actionTypes.CLEAR_BUDGET_SETUP
    })
}

/******************************************* REDUCER ************************************************/
const budgetReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_WORK_ORDERS:
            return {
                ...state,
                workOrders: action.payload.values
            }

        case actionTypes.ASSIGN_WORK_ORDER:
            const amount = state.workOrders.find(item => item.workOrderId === action.payload.value.id)[state.level];
            return {
                ...state,
                budgetAvailable: true,
                assignedWorkOrders: [...state.assignedWorkOrders, {
                    ...action.payload.value,
                    priceLevel: levelMapping(state.level),
                    quantity: 0,
                    total: amount === undefined ? 0 : amount,
                    amount: amount === undefined ? 0 : amount
                }]
            }

        case actionTypes.SAVE_NEW_DATA:
            const dataWithTotal = action.payload.values.map(item => {
                return (item.amount !== undefined && item.quantity !== undefined) ? {
                    ...item,
                    total: Number(item.quantity) * Number(item.amount)
                } : item
            })

            return {
                ...state,
                totalBudget: dataWithTotal.filter(item => item.total !== undefined).map(item => item.total).reduce((a, b) => a + b, 0),
                assignedWorkOrders: dataWithTotal,
                budgetAvailable: !!dataWithTotal.length
            }

        case actionTypes.REMOVE_ASSIGNED_ORDER:
            const filteredItems = state.assignedWorkOrders.filter(item => item.id !== action.payload.id);
            return {
                ...state,
                totalBudget: filteredItems.filter(item => item.total !== undefined).map(item => item.total).reduce((a, b) => a + b, 0),
                assignedWorkOrders: filteredItems,
                budgetAvailable: !!filteredItems.length
            }

        case actionTypes.SET_LEVEL:
            return {
                ...state,
                level: action.payload.value
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

        case actionTypes.SET_BUDGET_ITEMS:
            return {
                ...state,
                assignedWorkOrders: action.payload,
                totalBudget: action.payload.filter(item => item.total).map(item => item.total).reduce((a, b) => a + b, 0),
                budgetAvailable: !!action.payload.length
            }

        case actionTypes.ADD_EXTRA_METRIC:
            const budgetItems = [];
            state.assignedWorkOrders.forEach(item => {
                budgetItems.push(item);

                if (item.id == action.payload.id) {
                    budgetItems.push({
                        budgetItemId: `${item.id}-${action.payload.invoiceExtraMetricDescriptionId}`,
                        id: `${item.id}-${action.payload.invoiceExtraMetricDescriptionId}`,
                        title: invoiceExtraMetricDescription.find(d => d.id === action.payload.invoiceExtraMetricDescriptionId).name,
                        quantity: 0,
                        amount: 0,
                        total: 0,
                        workOrderId: item.id,
                        invoiceExtraMetricDescriptionId: action.payload.invoiceExtraMetricDescriptionId
                    });
                }
            });

            return {
                ...state,
                assignedWorkOrders: budgetItems
            }

        case actionTypes.CLEAR_BUDGET_SETUP:
            return INITIAL_STATE;

        default:
            return state;
    }
}

export default budgetReducer;