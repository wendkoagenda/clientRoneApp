import moment from "moment-timezone";
import { DEFAULT_TIME_ZONE, DEFAULT_WO_DURATION_IN_HOURS, getDefaultWoStartDate, getDefaultPickupWoStartDate, UTC_TIME_ZONE } from "../../helpers/date-time-helper";
import { isSoilReportType, isConcreteReportType } from "../../helpers/reportType-helper";


/***************************************** INITIAL STATE ********************************************/
const INITIAL_CLIENT_SEARCH_CRITERIA = {
    companyName: "",
    address: "",
    addressLine: "",
    city: "",
    state: "",
    zip: "",
    officeNumber: ""
};

const INITIAL_PROJECT_SEARCH_CRITERIA = {
    projectName: "",
    address: "",
    addressLine: "",
    city: "",
    state: "",
    zip: "",
    number: null
};

const INITIAL_DISPATCHES_SEARCH_REQUEST = {
    searchCriteria: '',
    sites: [],
    sortCriteria: 'project.name',
    isAscend: false,
    pageNumber: 1,
    pageSize: 200,
    isFiltered: false,
    isTemporaryClient: false,
    isTemporarySite: false
};

const INITIAL_STATE = {
    isEditMode: false,
    workOrders: [],
    managedDispatch: {
        workOrders: [],
        subWorkOrders: []
    },
    filteredProjects: [],
    projectSearchCriteria: INITIAL_PROJECT_SEARCH_CRITERIA,
    clientSearchCriteria: INITIAL_CLIENT_SEARCH_CRITERIA,
    filteredClients: [],
    assignedItems: {
        assignedProject: {},
        assignedClient: {}
    },
    editingStatus: false,
    editingDispatch: {},
    filteredOrders: null,
    dispatchesSearchRequest: INITIAL_DISPATCHES_SEARCH_REQUEST,
    paginatedDispatches: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    }
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "DISPATCH_";
const actionTypes = {
    SET_WORK_ORDERS: `${reducerName}SET_WORK_ORDERS`,
    ASSIGN_ORDERS: `${reducerName}ASSIGN_ORDERS`,
    UNASSIGN_ORDER: `${reducerName}UNASSIGN_ORDER`,
    ASSIGN_WORK_ORDER: `${reducerName}_ASSIGN_WORK_ORDER`,
    SET_HIDE_STATUS: `${reducerName}SET_HIDE_STATUS`,
    CHANGE_PROJECT_SEARCH_CRITERIA: `${reducerName}CHANGE_PROJECT_SEARCH_CRITERIA`,
    SET_FILTERED_PROJECTS_ON_DISPATCH: `${reducerName}SET_FILTERED_PROJECTS_ON_DISPATCH`,
    CHANGE_CLIENT_SEARCH_CRITERIA: `${reducerName}CHANGE_CLIENT_SEARCH_CRITERIA`,
    SET_FILTERED_CLIENTS_ON_DISPATCH: `${reducerName}SET_FILTERED_CLIENTS_ON_DISPATCH`,
    SET_ASSIGNED_ITEM: `${reducerName}SET_ASSIGNED_ITEM`,
    DISPATCH_SET_INITIAL_SEARCH_CRITERIAS: `${reducerName}DISPATCH_SET_INITIAL_SEARCH_CRITERIAS`,
    SET_EDITING_DISPATCH: `${reducerName}SET_EDITING_DISPATCH`,
    CLEAR_EDITING_DISPATCH: `${reducerName}CLEAR_EDITING_DISPATCH`,
    SET_FILTERED_WORK_ORDERS: `${reducerName}DISPATCH_SET_FILTERED_WORK_ORDERS`,
    DISPATCH_SET_WORK_ORDER_DATE_RANGE: `${reducerName}DISPATCH_SET_WORK_ORDER_DATE_RANGE`,
    SET_INITIAL_DISPATCHES_SEARCH_REQUEST: `${reducerName}SET_INITIAL_DISPATCHES_SEARCH_REQUEST`,
    SET_PAGINATED_DISPATCHES: `${reducerName}SET_PAGINATED_DISPATCHES`,
    SET_DISPATCHES_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_DISPATCHES_SEARCH_REQUEST_CRITERIA`,
    SET_DISPATCHES_SEARCH_REQUEST_SORTER: `${reducerName}SET_DISPATCHES_SEARCH_REQUEST_SORTER`,
    SET_DISPATCHES_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_DISPATCHES_SEARCH_REQUEST_PAGINATION`,
    SET_EDITING_DISPATCH_MODEL: `${reducerName}SET_EDITING_DISPATCH_MODEL`,
    SET_WORK_ORDERS_TESTS: `${reducerName}SET_WORK_ORDERS_TESTS`,
    SET_TEMPORARY_CLIENT_SEARCH_REQUEST: `${reducerName}SET_TEMPORARY_CLIENT_SEARCH_REQUEST`,
    SET_TEMPORARY_SITE_SEARCH_REQUEST: `${reducerName}SET_TEMPORARY_SITE_SEARCH_REQUEST`,
    CREATE_PICKUP_REQUEST: `${reducerName}CREATE_PICKUP_REQUEST`,
    SET_FULL_TIME_WORK_ORDER: `${reducerName}SET_FULL_TIME_WORK_ORDER`,
    SET_NOTES_WORK_ORDER: `${reducerName}SET_NOTES_WORK_ORDER`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setWorkOrders: (values) => ({
        type: actionTypes.SET_WORK_ORDERS,
        payload: values
    }),
    assignWorkOrders: (values) => ({
        type: actionTypes.ASSIGN_ORDERS,
        payload: { values }
    }),
    unassignWorkOrder: (id) => ({
        type: actionTypes.UNASSIGN_ORDER,
        payload: { id }
    }),
    assignWorkOrder: (workType, id) => ({
        type: actionTypes.ASSIGN_WORK_ORDER,
        payload: { workType, id }
    }),
    setHideStatus: (id, value) => ({
        type: actionTypes.SET_HIDE_STATUS,
        payload: { id, value }
    }),
    changeProjectSearchCriteria: (name, value) => ({
        type: actionTypes.CHANGE_PROJECT_SEARCH_CRITERIA,
        payload: { name, value }
    }),
    setFilteredProjects: (values) => ({
        type: actionTypes.SET_FILTERED_PROJECTS_ON_DISPATCH,
        payload: { values }
    }),
    changeClientSearchCriteria: (name, value) => ({
        type: actionTypes.CHANGE_PROJECT_SEARCH_CRITERIA,
        payload: { name, value }
    }),
    setFilteredClients: (values) => ({
        type: actionTypes.SET_FILTERED_CLIENTS_ON_DISPATCH,
        payload: { values }
    }),
    setAssignedItem: (name, values) => ({
        type: actionTypes.SET_ASSIGNED_ITEM,
        payload: { name, values }
    }),
    setInitialSearchCriterias: () => ({
        type: actionTypes.DISPATCH_SET_INITIAL_SEARCH_CRITERIAS
    }),
    setEditingDispatch: (id) => ({
        type: actionTypes.SET_EDITING_DISPATCH,
        payload: { id }
    }),
    clearEditingDispatch: () => ({
        type: actionTypes.CLEAR_EDITING_DISPATCH
    }),
    setFilteredWorkOrders: (value) => ({
        type: actionTypes.SET_FILTERED_WORK_ORDERS,
        payload: value
    }),
    setWorkOrderDateRange: (id, value) => ({
        type: actionTypes.DISPATCH_SET_WORK_ORDER_DATE_RANGE,
        payload: { id, value }
    }),
    setPaginatedDispatches: (value) => ({
        type: actionTypes.SET_PAGINATED_DISPATCHES,
        payload: value
    }),
    setDispatchesSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_DISPATCHES_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialDispatchesSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_DISPATCHES_SEARCH_REQUEST
    }),
    setDispatchesSearchRequestSorter: (value) => ({
        type: actionTypes.SET_DISPATCHES_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setDispatchesSearchRequestPagination: (value) => ({
        type: actionTypes.SET_DISPATCHES_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setEditingDispatchModel: (value) => ({
        type: actionTypes.SET_EDITING_DISPATCH_MODEL,
        payload: value
    }),
    setWorkOrdersTests: (id, values, workOrderTypeId) => ({
        type: actionTypes.SET_WORK_ORDERS_TESTS,
        payload: { id, values, workOrderTypeId }
    }),
    setTemporaryClientSearchRequest: (value) => ({
        type: actionTypes.SET_TEMPORARY_CLIENT_SEARCH_REQUEST,
        payload: { value }
    }),
    setTemporarySiteSearchRequest: (value) => ({
        type: actionTypes.SET_TEMPORARY_SITE_SEARCH_REQUEST,
        payload: { value }
    }),
    createPickupRequest: (value) => ({
        type: actionTypes.CREATE_PICKUP_REQUEST,
        payload: value
    }),
    setFullTimeWorkOrder: (id, value) => ({
        type: actionTypes.SET_FULL_TIME_WORK_ORDER,
        payload: { id, value }
    }),
    setNotesWorkOrder: (id, value) => ({
        type: actionTypes.SET_NOTES_WORK_ORDER,
        payload: { id, value }
    })
}

/******************************************* REDUCER ************************************************/
const dispatchReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_DISPATCHES:
            return {
                ...state,
                paginatedDispatches: action.payload
            };

        case actionTypes.SET_WORK_ORDERS_TESTS:
            return {
                ...state,
                managedDispatch: {
                    subWorkOrders: state.managedDispatch.subWorkOrders,
                    workOrders: state.managedDispatch.workOrders.map(item => {
                        if (item.id == action.payload.id && isConcreteReportType(action.payload.workOrderTypeId)) {
                            return {
                                ...item,
                                dispatchRequestWorkOrderConcreteTests: action.payload.values
                            }
                        } else if (item.id == action.payload.id && isSoilReportType(action.payload.workOrderTypeId)) {
                            return {
                                ...item,
                                dispatchRequestWorkOrderSoilTests: action.payload.values
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
                dispatchesSearchRequest: {
                    ...state.dispatchesSearchRequest,
                    isTemporarySite: action.payload.value,
                    isTemporaryClient: (action.payload.value && state.dispatchesSearchRequest.isTemporaryClient) && false,
                    isFiltered: action.payload.value && true
                }
            }

        case actionTypes.SET_TEMPORARY_CLIENT_SEARCH_REQUEST:
            return {
                ...state,
                dispatchesSearchRequest: {
                    ...state.dispatchesSearchRequest,
                    isTemporaryClient: action.payload.value,
                    isTemporarySite: (action.payload.value && state.dispatchesSearchRequest.isTemporarySite) && false,
                    isFiltered: action.payload.value && true
                }
            }

        case actionTypes.SET_DISPATCHES_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                dispatchesSearchRequest: {
                    ...state.dispatchesSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_INITIAL_DISPATCHES_SEARCH_REQUEST:
            return {
                ...state,
                dispatchesSearchRequest: INITIAL_DISPATCHES_SEARCH_REQUEST
            };

        case actionTypes.SET_DISPATCHES_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                dispatchesSearchRequest: {
                    ...state.dispatchesSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_DISPATCHES_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                dispatchesSearchRequest: {
                    ...state.dispatchesSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_WORK_ORDERS:
            return {
                ...state,
                workOrders: action.payload
            };

        case actionTypes.ASSIGN_ORDERS:
            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: action.payload.values
                }
            };

        case actionTypes.UNASSIGN_ORDER:
            const itemToRemove = state.managedDispatch.workOrders.find(item => item.id == action.payload.id);
            if (itemToRemove.parentWorkOrderId) {
                return {
                    ...state,
                    managedDispatch: {
                        ...state.managedDispatch,
                        workOrders: state.managedDispatch.workOrders.filter(item => item.id != action.payload.id)
                    }
                }
            }

            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: state.managedDispatch.workOrders.filter(
                        item => item.id != action.payload.id && item.parentWorkOrderId != action.payload.id && item.parentWorkOrderId != itemToRemove.dispatchRequestWorkOrderId
                    )
                }
            };

        case actionTypes.DISPATCH_SET_WORK_ORDER_DATE_RANGE:
            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: state.managedDispatch.workOrders.map(item => {
                        if (item.id != action.payload.id) {
                            return item;
                        }

                        let startDate = action.payload.value
                            ? moment(moment.tz(action.payload.value[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                            : getDefaultWoStartDate().format();
                        let endDate = action.payload.value
                            ? moment(moment.tz(action.payload.value[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                            : getDefaultWoStartDate().add(DEFAULT_WO_DURATION_IN_HOURS, "hours").format();

                        return {
                            ...item,
                            startDate: startDate,
                            endDate: endDate
                        }
                    })
                }
            }

        case actionTypes.SET_FULL_TIME_WORK_ORDER:
            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: state.managedDispatch.workOrders.map(item => {
                        if (item.id == action.payload.id) {
                            return {
                                ...item,
                                isFullTimeWorkOrder: action.payload.value
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.SET_NOTES_WORK_ORDER:
            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: state.managedDispatch.workOrders.map(item => {
                        if (item.id == action.payload.id) {
                            return {
                                ...item,
                                notes: action.payload.value
                            }
                        } else {
                            return item;
                        }
                    })
                }
            }

        case actionTypes.ASSIGN_WORK_ORDER:
            let incomingWorkOrders = [];

            const estimatedStartDate = getDefaultWoStartDate();

            const selectedWorkOrder = {
                ...state.workOrders[action.payload.workType].find(wo => wo.id == action.payload.id),
                startDate: estimatedStartDate.format(),
                endDate: estimatedStartDate.add(DEFAULT_WO_DURATION_IN_HOURS, "hours").format()
            }

            incomingWorkOrders.push(selectedWorkOrder);
            if (selectedWorkOrder.isPickupNeeded) {
                const pickupRequestEstimatedStartDate = getDefaultPickupWoStartDate(estimatedStartDate);

                incomingWorkOrders.push({
                    id: -selectedWorkOrder.id,
                    title: `Pickup request for ${selectedWorkOrder.title}`,
                    category: selectedWorkOrder.category,
                    parentWorkOrderId: selectedWorkOrder.id,
                    startDate: pickupRequestEstimatedStartDate.format(),
                    endDate: pickupRequestEstimatedStartDate.add(DEFAULT_WO_DURATION_IN_HOURS, "hours").format()
                });
            }

            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: [...state.managedDispatch.workOrders, ...incomingWorkOrders]
                }
            };

        case actionTypes.CREATE_PICKUP_REQUEST:
            const parentWorkOrder = state.managedDispatch.workOrders.find(item => item.id == action.payload.id);
            const pickupRequestEstimatedStartDate = getDefaultPickupWoStartDate(parentWorkOrder.startDate);

            const pickupRequest = {
                id: -parentWorkOrder.id,
                title: `Pickup request for ${parentWorkOrder.title}`,
                category: parentWorkOrder.category,
                parentWorkOrderId: parentWorkOrder.id,
                startDate: pickupRequestEstimatedStartDate.format(),
                endDate: pickupRequestEstimatedStartDate.add(DEFAULT_WO_DURATION_IN_HOURS, "hours").format()
            }

            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    workOrders: [...state.managedDispatch.workOrders.filter(item => item.id != action.payload.id), { ...parentWorkOrder }, { ...pickupRequest }]
                }
            }

        case actionTypes.SET_HIDE_STATUS:
            return {
                ...state,
                managedDispatch: {
                    ...state.managedDispatch,
                    subWorkOrders: state.workOrders.forEach(item => {
                        if (item.id == action.payload.id) {
                            item.isHidedSub = action.payload.value;
                        }
                    })
                }
            }

        case actionTypes.CHANGE_PROJECT_SEARCH_CRITERIA:
            return {
                ...state,
                projectSearchCriteria: {
                    ...state.projectSearchCriteria,
                    [action.payload.name]: action.payload.value
                }
            }

        case actionTypes.SET_FILTERED_PROJECTS_ON_DISPATCH:
            return {
                ...state,
                filteredProjects: action.payload.values
            }

        case actionTypes.CHANGE_CLIENT_SEARCH_CRITERIA:
            return {
                ...state,
                clientSearchCriteria: {
                    ...state.clientSearchCriteria,
                    [action.payload.name]: action.payload.value
                }
            }

        case actionTypes.SET_FILTERED_CLIENTS_ON_DISPATCH:
            return {
                ...state,
                filteredClients: action.payload.values
            }

        case actionTypes.SET_ASSIGNED_ITEM:
            return {
                ...state,
                assignedItems: {
                    ...state.assignedItems,
                    [action.payload.name]: action.payload.values
                }
            }

        case actionTypes.DISPATCH_SET_INITIAL_SEARCH_CRITERIAS:
            return {
                ...state,
                clientSearchCriteria: INITIAL_CLIENT_SEARCH_CRITERIA,
                projectSearchCriteria: INITIAL_PROJECT_SEARCH_CRITERIA
            }

        case actionTypes.SET_EDITING_DISPATCH:
            const dispatch = state.paginatedDispatches.data.find(item => item.id == action.payload.id);

            return {
                ...state,
                editingDispatch: dispatch,
                editingStatus: true
            }

        case actionTypes.SET_EDITING_DISPATCH_MODEL:
            return {
                ...state,
                editingDispatch: action.payload,
                editingStatus: true
            }

        case actionTypes.CLEAR_EDITING_DISPATCH:
            return {
                ...state,
                editingDispatch: {},
                editingStatus: false,
                managedDispatch: {
                    workOrders: [],
                    subWorkOrders: []
                },
                assignedItems: {
                    assignedProject: {},
                    assignedClient: {}
                },
            }

        case actionTypes.SET_FILTERED_WORK_ORDERS:
            return {
                ...state,
                filteredOrders: action.payload
            }

        default:
            return state;
    }
}

export default dispatchReducer;