import moment from 'moment';
import { getWorkOrderStatus, workOrderStatuses } from '../../constants/order-statuses'
import { WACO_POSITION } from '../../helpers/map-helper';
import { DEFAULT_UTC_OFFSET } from '../../helpers/timeline-helper';
/*****************************************INITIAL STATE********************************************/
const INITIAL_STATE = {
    technicians: [],
    filteredTechnicians: [],
    timelineValues: [],
    date: new Date(moment.utc().format()),
    assignedWorkOrders: [],
    unassignWorkOrders: [],
    filteredWorkOrders: [],
    isLoading: false,
    currentSites: [],
    centerPosition: [...WACO_POSITION],
    zoomValue: 8,
    isRegularMode: true,
    zIndexValue: { value: 1, techId: 0 },
    filteredSites: []
};
/*****************************************ACTION TYPES*********************************************/
const reducerName = "DISPATCH_PROCESS_";
const actionTypes = {
    SET_TECHNICIANS: `${reducerName}SET_TECHNICIANS`,
    CHANGE_DATE: `${reducerName}CHANGE_DATE`,
    SET_NEW_DATE: `${reducerName}SET_NEW_DATE`,
    SET_UNASSIGN_WORK_ORDERS: `${reducerName}SET_UNASSIGN_WORK_ORDERS`,
    ASSIGN_WORK_ORDER: `${reducerName}ASSIGN_WORK_ORDER`,
    ASSIGN_WORK_ORDERS: `${reducerName}ASSIGN_WORK_ORDERS`,
    UNASSIGN_WORK_ORDER: `${reducerName}UNASSIGN_WORK_ORDER`,
    CHANGE_WORK_ORDER: `${reducerName}CHANGE_WORK_ORDER`,
    SET_TIMELINE_VALUES: `${reducerName}ET_TIMELINE_VALUES`,
    CHANGE_LOADING_STATE: `${reducerName}CHANGE_LOADING_STATE`,
    SEND_WORK_ORDERS_NOTIFICATION: `${reducerName}SEND_WORK_ORDERS_NOTIFICATION`,
    CONFIRM_WORK_ORDERS: `${reducerName}CONFIRM_WORK_ORDERS`,
    SET_CURRENT_SITES: `${reducerName}SET_CURRENT_SITES`,
    SET_ZOOM_VALUE: `${reducerName}SET_ZOOM_VALUE`,
    SET_REGULAR_MODE: `${reducerName}SET_REGULAR_MODE`,
    SET_CENTER_POSITION: `${reducerName}SET_CENTER_POSITION`,
    SET_Z_INDEX_VALUE: `${reducerName}SET_Z_INDEX_VALUE`,
    SET_LOADING: `${reducerName}SET_LOADING`,
    CLEAR_PAGE_STATE: `${reducerName}CLEAR_PAGE_STATE`,
    SET_FILTERED_SITES: `${reducerName}SET_FILTERED_SITES`,
    SUBMIT_WORK_ORDERS_FILTERING: `${reducerName}SUBMIT_WORK_ORDERS_FILTERING`,
    COMPLETE_WORK_ORDER: `${reducerName}COMPLETE_WORK_ORDER`,
    REMOVE_COMPLETED_WORK_ORDERS: `${reducerName}REMOVE_COMPLETED_WORK_ORDERS`
};
/********************************************ACTIONS************************************************/
export const actions = {
    setTechnicians: (values) => ({
        type: actionTypes.SET_TECHNICIANS,
        payload: { values },
    }),
    changeDate: (value) => ({
        type: actionTypes.CHANGE_DATE,
        payload: { value },
    }),
    assignWorkOrder: (values) => ({
        type: actionTypes.ASSIGN_WORK_ORDER,
        payload: { values },
    }),
    assignWorkOrders: (value) => ({
        type: actionTypes.ASSIGN_WORK_ORDERS,
        payload: value
    }),
    unassignWorkOrder: (values) => ({
        type: actionTypes.UNASSIGN_WORK_ORDER,
        payload: { values },
    }),
    setUnassignWorkOrders: (values) => ({
        type: actionTypes.SET_UNASSIGN_WORK_ORDERS,
        payload: { values },
    }),
    changeWorkOrder: (values) => ({
        type: actionTypes.CHANGE_WORK_ORDER,
        payload: { values }
    }),
    setTimelineValues: (values) => ({
        type: actionTypes.SET_TIMELINE_VALUES,
        payload: { values }
    }),
    changeLoadingState: (value) => ({
        type: actionTypes.CHANGE_LOADING_STATE,
        payload: { value }
    }),
    sendWorkOrderNotification: (values) => ({
        type: actionTypes.SEND_WORK_ORDERS_NOTIFICATION,
        payload: { values }
    }),
    confirmWorkOrders: (values) => ({
        type: actionTypes.CONFIRM_WORK_ORDERS,
        payload: { values }
    }),
    setCurrentSites: (values) => ({
        type: actionTypes.SET_CURRENT_SITES,
        payload: { values }
    }),
    setNewDate: (value) => ({
        type: actionTypes.SET_NEW_DATE,
        payload: { value }
    }),
    setZoomValue: (value) => ({
        type: actionTypes.SET_ZOOM_VALUE,
        payload: { value }
    }),
    setCenterPosition: (value) => ({
        type: actionTypes.SET_CENTER_POSITION,
        payload: { value }
    }),
    setRegularMode: (value) => ({
        type: actionTypes.SET_REGULAR_MODE,
        payload: { value }
    }),
    setZIndexValue: (value) => ({
        type: actionTypes.SET_Z_INDEX_VALUE,
        payload: { value }
    }),
    setLoading: (value) => ({
        type: actionTypes.SET_LOADING,
        payload: { value }
    }),
    clearPageState: () => ({
        type: actionTypes.CLEAR_PAGE_STATE
    }),
    setFilteredSites: (values) => ({
        type: actionTypes.SET_FILTERED_SITES,
        payload: { values }
    }),
    submitWorkOrdersFiltering: () => ({
        type: actionTypes.SUBMIT_WORK_ORDERS_FILTERING
    }),
    completeWorkOrder: (values) => ({
        type: actionTypes.COMPLETE_WORK_ORDER,
        payload: { values }
    }),
    removeCompletedWorkOrders: (values) => ({
        type: actionTypes.REMOVE_COMPLETED_WORK_ORDERS,
        payload: values
    })
};
/*******************************************REDUCER******************************************/
const dispatchProcessReducer = function (state = INITIAL_STATE, action) {
    const emptyTechnician = "";
    const emptyTechnicianId = 0;
    switch (action.type) {
        case actionTypes.SET_TECHNICIANS:
            return {
                ...state,
                technicians: action.payload.values,
                filteredTechnicians: action.payload.values
            };

        case actionTypes.SUBMIT_WORK_ORDERS_FILTERING:
            return {
                ...state,
                filteredWorkOrders: state.filteredSites.length ? state.unassignWorkOrders.filter(item => state.filteredSites.some(i => i == item.project.siteId)) : state.unassignWorkOrders
            }

        case actionTypes.SET_FILTERED_SITES:
            return {
                ...state,
                filteredSites: action.payload.values
            }

        case actionTypes.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload.value
            }

        case actionTypes.SET_Z_INDEX_VALUE:
            return {
                ...state,
                zIndexValue: action.payload.value
            }

        case actionTypes.SET_REGULAR_MODE:
            return {
                ...state,
                isRegularMode: action.payload.value
            };

        case actionTypes.SET_ZOOM_VALUE:
            return {
                ...state,
                zoomValue: action.payload.value
            };

        case actionTypes.SET_CENTER_POSITION:
            return {
                ...state,
                centerPosition: action.payload.value
            };

        case actionTypes.CHANGE_LOADING_STATE:
            return {
                ...state,
                isLoading: action.payload.value
            }

        case actionTypes.SET_TIMELINE_VALUES:
            return {
                ...state,
                timelineValues: action.payload.values
            }

        case actionTypes.SET_NEW_DATE:
            const updatedDay = moment(state.date).utcOffset(DEFAULT_UTC_OFFSET).set({ 'year': action.payload.value.year(), 'month': action.payload.value.month(), 'date': action.payload.value.date() }).toDate();
            const updatedTimeline = state.timelineValues.map(item => {
                return moment(item).utcOffset(DEFAULT_UTC_OFFSET).set({ 'year': action.payload.value.year(), 'month': action.payload.value.month(), 'date': action.payload.value.date() }).toDate();
            });

            return {
                ...state,
                date: updatedDay,
                timelineValues: updatedTimeline
            }

        case actionTypes.SET_CURRENT_SITES:

            return {
                ...state,
                currentSites: action.payload.values,
                filteredTechnicians: state.technicians.filter(item => action.payload.values.some(s => s == item.rootSiteId))
            }

        case actionTypes.SEND_WORK_ORDERS_NOTIFICATION:

            return {
                ...state,
                assignedWorkOrders: state.assignedWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        statusId: action.payload.values.statusId,
                        status: getWorkOrderStatus(action.payload.values.statusId)
                    } : item
                }),
                unassignWorkOrders: state.unassignWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        statusId: action.payload.values.statusId,
                        status: getWorkOrderStatus(action.payload.values.statusId)
                    } : item
                })
            }

        case actionTypes.COMPLETE_WORK_ORDER:
            return {
                ...state,
                assignedWorkOrders: state.assignedWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        statusId: action.payload.values.statusId,
                        status: getWorkOrderStatus(action.payload.values.statusId)
                    } : item
                }),
                unassignWorkOrders: state.unassignWorkOrders.filter(item => !(item.dispatchRequestId == action.payload.values.dispatchRequestId && item.workOrder.id == action.payload.values.workOrderId)),
                filteredWorkOrders: state.filteredWorkOrders.filter(item => !(item.dispatchRequestId == action.payload.values.dispatchRequestId && item.workOrder.id == action.payload.values.workOrderId))
            }

        case actionTypes.CONFIRM_WORK_ORDERS:
            return {
                ...state,
                assignedWorkOrders: state.assignedWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        isConfirmed: true
                    } : item;
                }),
                unassignWorkOrders: state.unassignWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        isConfirmed: true
                    } : item;
                }),
                filteredWorkOrders: state.filteredWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        isConfirmed: true
                    } : item;
                }),
            }

        case actionTypes.CHANGE_DATE:
            const nd = moment(state.date).utcOffset(DEFAULT_UTC_OFFSET).add('days', action.payload.value).toDate();
            const newValues = state.timelineValues.map(item => {
                return moment(item).utcOffset(DEFAULT_UTC_OFFSET).add('days', action.payload.value).toDate();
            });

            return {
                ...state,
                date: nd,
                timelineValues: newValues
            };

        case actionTypes.ASSIGN_WORK_ORDERS:
            const inputWorkOrdersIds = action.payload.map(wo => wo.id);
            const allFilteredItems = state.assignedWorkOrders.filter(item => !inputWorkOrdersIds.some(i => i.id == item.id));

            let assignedWorkOrders = [];
            let unassignWorkOrders = [...state.unassignWorkOrders];
            let filteredWorkOrders = [...state.filteredWorkOrders];

            action.payload.forEach(wo => {
                const workOrderExistingProperties = state.unassignWorkOrders.find(item => item.id == wo.id);
                const technician = state.technicians.find((item) => item.technicianId == wo.technicianId);

                assignedWorkOrders.push({
                    ...workOrderExistingProperties,
                    technician: technician,
                    technicianId: technician.technicianId,
                    startAt: wo.startAt,
                    endAt: wo.endAt,
                });

                unassignWorkOrders = unassignWorkOrders.map(uWo => {
                    if (uWo.id == wo.id) {
                        return {
                            ...uWo,
                            technician: technician.fullName,
                            technicianId: technician.technicianId,
                            startAt: wo.startAt,
                            endAt: wo.endAt,
                        }
                    }

                    return uWo;
                });

                filteredWorkOrders = filteredWorkOrders.map(fWo => {
                    if (fWo.id == wo.id) {
                        return {
                            ...fWo,
                            technician: technician.fullName,
                            technicianId: technician.technicianId,
                            startAt: wo.startAt,
                            endAt: wo.endAt,
                        }
                    }

                    return fWo;
                })
            });

            return {
                ...state,
                isLoading: false,
                assignedWorkOrders: [
                    ...allFilteredItems,
                    ...assignedWorkOrders
                ],
                unassignWorkOrders: unassignWorkOrders,
                filteredWorkOrders: filteredWorkOrders
            }

        case actionTypes.ASSIGN_WORK_ORDER:
            const orderItems = state.unassignWorkOrders.find(item => item.id == action.payload.values.id);
            const technician = state.technicians.find((item) => item.technicianId == action.payload.values.technicianId);
            const filteredItems = state.assignedWorkOrders.filter(item => item.id != action.payload.values.id);
            const woDuration = moment.utc(action.payload.values.endAt).diff(moment.utc(action.payload.values.startAt), 'minutes');

            return {
                ...state,
                isLoading: false,
                assignedWorkOrders: [
                    ...filteredItems,
                    {
                        ...orderItems,
                        workOrder: {
                            ...orderItems.workOrder,
                            assignedDuration: woDuration
                        },
                        technician: technician,
                        technicianId: technician.technicianId,
                        startAt: action.payload.values.startAt,
                        endAt: action.payload.values.endAt,
                    }
                ],
                unassignWorkOrders: state.unassignWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        technician: technician.fullName,
                        technicianId: technician.technicianId,
                        startAt: action.payload.values.startAt,
                        endAt: action.payload.values.endAt,
                    } : item
                }),
                filteredWorkOrders: state.filteredWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        technician: technician.fullName,
                        technicianId: technician.technicianId,
                        startAt: action.payload.values.startAt,
                        endAt: action.payload.values.endAt,
                    } : item
                })
            }

        case actionTypes.UNASSIGN_WORK_ORDER:
            return {
                ...state,
                isLoading: false,
                assignedWorkOrders: state.assignedWorkOrders.filter(item => item.id != action.payload.values.id),
                unassignWorkOrders: state.unassignWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        technician: emptyTechnician,
                        technicianId: emptyTechnicianId,
                        statusId: action.payload.values.statusId,
                        status: getWorkOrderStatus(action.payload.values.statusId),
                        isConfirmed: item.isConfirmed
                    } : item
                }),
                filteredWorkOrders: state.filteredWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? {
                        ...item,
                        technician: emptyTechnician,
                        technicianId: emptyTechnicianId,
                        statusId: action.payload.values.statusId,
                        status: getWorkOrderStatus(action.payload.values.statusId),
                        isConfirmed: item.isConfirmed
                    } : item
                })
            }

        case actionTypes.CHANGE_WORK_ORDER:
            const changedWorkOrder = state.unassignWorkOrders.find(item => item.id == action.payload.values.id);
            const orderTechnician = state.technicians.find(item => item.technicianId == action.payload.values.technicianId);
            const ordersWithoutUpdates = state.assignedWorkOrders.filter(item => item.id != action.payload.values.id);
            const duration = moment.utc(action.payload.values.endAt).diff(moment.utc(action.payload.values.startAt), 'minutes');

            const updatedOrder = {
                ...changedWorkOrder,
                workOrder: {
                    ...changedWorkOrder.workOrder,
                    assignedDuration: duration
                },
                technician: orderTechnician,
                status: getWorkOrderStatus(action.payload.values.statusId),
                isConfirmed: false,
                ...action.payload.values,
                duration: duration
            }

            const { endAt, ...values } = updatedOrder;

            const filteredValues = {
                ...values,
                technician: values.technician.fullName
            }
            return {
                ...state,
                isLoading: false,
                assignedWorkOrders: [
                    ...ordersWithoutUpdates,
                    updatedOrder
                ],
                unassignWorkOrders: state.unassignWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? filteredValues : item
                }),
                filteredWorkOrders: state.filteredWorkOrders.map(item => {
                    return item.id == action.payload.values.id ? filteredValues : item
                })
            }

        case actionTypes.SET_UNASSIGN_WORK_ORDERS:
            return {
                ...state,
                unassignWorkOrders: action.payload.values,
            };

        case actionTypes.CLEAR_PAGE_STATE:
            return INITIAL_STATE;

        case actionTypes.REMOVE_COMPLETED_WORK_ORDERS:
            return {
                ...state,
                assignedWorkOrders: state.assignedWorkOrders.filter(item => item.statusId !== workOrderStatuses.Completed),
                unassignWorkOrders: [...state.unassignWorkOrders.filter(item => item.statusId !== workOrderStatuses.Completed),
                ...action.payload]
            };

        default:
            return state;
    }
};

export default dispatchProcessReducer;