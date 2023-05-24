import { filter, sum } from "lodash";
import moment from "moment-timezone";
import { invoiceOrderStatuses } from "../../constants/invoice-order-statuses";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";
import { calculateExtraMetricTotal } from "../../helpers/math-helper";
import { NEW_WORK_ORDER_ID_TEMPLATE } from "./invoice-page";

/***************************************** INITIAL STATE ********************************************/
export const DEFAULT_PAGE_NUMBER = 200;

export const orderProps = {
    QUANTITY: 'quantity',
    RATE: 'rate',
    TITLE: 'title',
    BILLING_CODE: 'billingCode',
    DISPATCH_ID: 'dispatchRequestWorkOrderId',
    STATUS_ID: 'invoiceStatusId',
    DATE: 'actualEndDate'
}

export const invoiceFilterProps = {
    CLIENT: {
        PROP_NAME: 'clientIds',
        PLACEHOLDER: 'Business Party',
        FILTER_PROP_NAME: 'clients'
    },
    PROJECT: {
        PROP_NAME: 'projectIds',
        PLACEHOLDER: 'Project',
        FILTER_PROP_NAME: 'projects'
    },
    MANAGER: {
        PROP_NAME: 'projectManagerIds',
        PLACEHOLDER: 'Project Manager',
        FILTER_PROP_NAME: 'projectManagers'
    },
    STATUS: {
        PROP_NAME: 'invoiceStatusIds',
        PLACEHOLDER: 'Statuses',
        FILTER_PROP_NAME: 'statuses'
    }
}

const INITIAL_INVOICE_SEARCH_REQUEST = {
    dateFrom: undefined,
    dateTo: undefined,
    [invoiceFilterProps.CLIENT.PROP_NAME]: undefined,
    [invoiceFilterProps.PROJECT.PROP_NAME]: undefined,
    [invoiceFilterProps.MANAGER.PROP_NAME]: undefined,
    [invoiceFilterProps.STATUS.PROP_NAME]: undefined,
    sortCriteria: undefined,
    isAscend: true,
    dispatchRequestWorkOrderIds: undefined
};

const INITIAL_PDF_CONFIG = {
    margin: [0, 10, 0, 10],
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 4 },
    jsPDF: { format: 'a4' },
    pagebreak: { after: '.page' }
};

const INITIAL_STATE = {
    invoiceSearchRequest: INITIAL_INVOICE_SEARCH_REQUEST,
    filterProps: {},
    invoiceGenerateResponse: [],
    pdfConfig: INITIAL_PDF_CONFIG,
    paginatedInvoice: {
        data: [],
        paginatedData: [],
        recordsCount: 0,
        minIndex: 0,
        current: 1,
        maxIndex: DEFAULT_PAGE_NUMBER
    }
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "INVOICE_";
const actionTypes = {
    SET_INITIAL_INVOICE_SEARCH_REQUEST: `${reducerName}SET_INITIAL_INVOICE_SEARCH_REQUEST`,
    SET_PAGINATED_INVOICE: `${reducerName}SET_PAGINATED_INVOICE`,
    SET_INVOICE_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_INVOICE_SEARCH_REQUEST_CRITERIA`,
    SET_INVOICE_SEARCH_REQUEST_SORTER: `${reducerName}SET_INVOICE_SEARCH_REQUEST_SORTER`,
    SET_INVOICE_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_INVOICE_SEARCH_REQUEST_PAGINATION`,
    SET_INVOICE_SEARCH_REQUEST_DATE_RANGE: `${reducerName}SET_INVOICE_SEARCH_REQUEST_DATE_RANGE`,
    CHANGE_ORDER_PROPERTY: `${reducerName}CHANGE_ORDER_PROPERTY`,
    UPDATE_INVOICE_EXTRA_METRICS_TOTAL: `${reducerName}UPDATE_INVOICE_EXTRA_METRICS_TOTAL`,
    CHANGE_METRIC_PROPERTY: `${reducerName}CHANGE_METRIC_PROPERTY`,
    CHANGE_PAGE: `${reducerName}CHANGE_PAGE`,
    SET_FILTER_PROPS: `${reducerName}SET_FILTER_PROPS`,
    SET_INVOICE_SEARCH_REQUEST_FILTER_PROPS: `${reducerName}SET_INVOICE_SEARCH_REQUEST_FILTER_PROPS`,
    ADD_NEW_ORDER: `${reducerName}ADD_NEW_ORDER`,
    REMOVE_NEW_ORDER: `${reducerName}REMOVE_NEW_ORDER`,
    SET_INVOICE_GENERATE_RESPONSE: `${reducerName}SET_INVOICE_GENERATE_RESPONSE`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setPaginatedInvoice: (value) => ({
        type: actionTypes.SET_PAGINATED_INVOICE,
        payload: value
    }),
    setInvoiceSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_INVOICE_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialInvoiceSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_INVOICE_SEARCH_REQUEST
    }),
    setInvoiceSearchRequestSorter: (value) => ({
        type: actionTypes.SET_INVOICE_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setInvoiceSearchRequestPagination: (value) => ({
        type: actionTypes.SET_INVOICE_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setInvoiceSearchRequestDateRange: (value) => ({
        type: actionTypes.SET_INVOICE_SEARCH_REQUEST_DATE_RANGE,
        payload: value
    }),
    changeOrderProperty: (values) => ({
        type: actionTypes.CHANGE_ORDER_PROPERTY,
        payload: values
    }),
    updateInvoiceExtraMetricsTotal: (values) => ({
        type: actionTypes.UPDATE_INVOICE_EXTRA_METRICS_TOTAL,
        payload: values
    }),
    changeMetricProperty: (values) => ({
        type: actionTypes.CHANGE_METRIC_PROPERTY,
        payload: values
    }),
    changePage: (value) => ({
        type: actionTypes.CHANGE_PAGE,
        payload: { value }
    }),
    setFilterProps: (values) => ({
        type: actionTypes.SET_FILTER_PROPS,
        payload: { values }
    }),
    setInvoiceSearchRequestFilterProps: (criteria, values) => ({
        type: actionTypes.SET_INVOICE_SEARCH_REQUEST_FILTER_PROPS,
        payload: { criteria, values }
    }),
    addNewOrder: (values) => ({
        type: actionTypes.ADD_NEW_ORDER,
        payload: values
    }),
    removeNewOrder: (values) => ({
        type: actionTypes.REMOVE_NEW_ORDER,
        payload: values
    }),
    setInvoiceGenerateResponse: (values) => ({
        type: actionTypes.SET_INVOICE_GENERATE_RESPONSE,
        payload: { values }
    })
}

/******************************************* REDUCER ************************************************/
const invoiceReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_INVOICE:
            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: action.payload.clients,
                    recordsCount: action.payload.clients.length,
                    paginatedData: action.payload.clients
                        .filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                        .map(c => {
                            return {
                                ...c,
                                projects: c.projects.map(p => {
                                    return {
                                        ...p,
                                        sumOfTotal: sum(p.workOrders.flatMap(t => {
                                            return [
                                                t?.total,
                                                sum(t.invoiceExtraMetrics.flatMap(i =>
                                                    i?.rate * i?.quantity
                                                ))
                                            ]
                                        })),
                                        workOrders: p.workOrders.map(w => {
                                            return {
                                                ...w,
                                                invoiceExtraMetrics: w.invoiceExtraMetrics
                                                    ? w.invoiceExtraMetrics.map(m => {
                                                        return {
                                                            ...m,
                                                            total: calculateExtraMetricTotal(m?.quantity, m?.rate)
                                                        }
                                                    })
                                                    : []
                                            }
                                        })
                                    }
                                })
                            }
                        })
                }
            };

        case actionTypes.SET_INVOICE_GENERATE_RESPONSE:
            return {
                ...state,
                invoiceGenerateResponse: action.payload.values
            }

        case actionTypes.SET_FILTER_PROPS:
            const mappedValues = Object.entries(action.payload.values).map(([filterName, values]) => {
                return [
                    filterName, Object.entries(values).map(([key, value]) => {
                        return {
                            key,
                            value: key,
                            displayValue: value
                        }
                    })
                ]
            });

            return {
                ...state,
                filterProps: Object.fromEntries(mappedValues)
            }

        case actionTypes.SET_INVOICE_SEARCH_REQUEST_FILTER_PROPS:
            return {
                ...state,
                invoiceSearchRequest: {
                    ...state.invoiceSearchRequest,
                    [action.payload.criteria]: action.payload.values
                }
            }

        case actionTypes.CHANGE_PAGE:
            const currentPage = action.payload.value;
            const updatedMinIndex = (currentPage - 1) * DEFAULT_PAGE_NUMBER;
            const updatedMaxIndex = currentPage * DEFAULT_PAGE_NUMBER;

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    current: currentPage,
                    minIndex: updatedMinIndex,
                    maxIndex: updatedMaxIndex,
                    paginatedData: state.paginatedInvoice.data.filter((_item, index) => (index >= updatedMinIndex && index < updatedMaxIndex))
                }
            }

        case actionTypes.ADD_NEW_ORDER:
            const dataWithNewOrder = state.paginatedInvoice.data.map(client => {
                return client.id === action.payload.clientId ? {
                    ...client,
                    projects: client.projects.map(project => {
                        return project.id === action.payload.projectId ? {
                            ...project,
                            workOrders: [
                                {
                                    isNewOrder: true,
                                    title: '',
                                    actualEndDate: '',
                                    dispatchRequestWorkOrderId: `${NEW_WORK_ORDER_ID_TEMPLATE}${action.payload.addCount}`,
                                    invoiceStatusId: invoiceOrderStatuses.READY_TO_INVOICE
                                },
                                ...project.workOrders
                            ]
                        } : project
                    })
                } : client
            });

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: dataWithNewOrder,
                    paginatedData: dataWithNewOrder.filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                }
            }

        case actionTypes.REMOVE_NEW_ORDER:
            const dataWithoutNewOrder = state.paginatedInvoice.data.map(client => {
                return client.id === action.payload.clientId ? {
                    ...client,
                    projects: client.projects.map(project => {
                        return project.id === action.payload.projectId ? {
                            ...project,
                            sumOfTotal: sum(project.workOrders?.filter(wo => !wo.isNewOrder).flatMap(t => {
                                return [
                                    t?.quantity * t?.rate,
                                    sum(t.invoiceExtraMetrics?.flatMap(i =>
                                        i?.rate * i?.quantity
                                    ))
                                ]
                            })),
                            workOrders: project.workOrders.filter(order => order.dispatchRequestWorkOrderId != action.payload.dispatchRequestWorkOrderId)
                        } : project
                    })
                } : client
            });

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: dataWithoutNewOrder,
                    paginatedData: dataWithoutNewOrder.filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                }
            }

        case actionTypes.CHANGE_ORDER_PROPERTY:
            const { property, workOrderId, projectId, clientId, value } = action.payload;

            const updatedData = state.paginatedInvoice.data.map(client => {
                return client.id === clientId ? {
                    ...client,
                    projects: client.projects.map(project => {
                        return project.id === projectId ? {
                            ...project,
                            sumOfTotal: sum(project.workOrders?.flatMap(o => {
                                return [
                                    property === 'rate' ? value * o?.quantity : o?.rate * value
                                ]
                            })),
                            workOrders: project.workOrders.map(order => {
                                const quantity = property == orderProps.QUANTITY ? Number(value) : order.quantity;
                                const rate = property == orderProps.RATE ? Number(value) : order.rate;

                                return order.dispatchRequestWorkOrderId === workOrderId ? {
                                    ...order,
                                    [property]: (property == orderProps.QUANTITY || property == orderProps.RATE) ? Number(value) : value,
                                    total: quantity * rate
                                } : order
                            })
                        } : project
                    })
                } : client
            });

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: updatedData,
                    paginatedData: updatedData.filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                }
            }

        case actionTypes.CHANGE_METRIC_PROPERTY:
            const [metricProperty, metricValue, metricClientId, metricProjectId, metricWorkOrderId, metricId] = Object.values(action.payload);

            const dataWithUpdatedMetric = state.paginatedInvoice.data.map(client => {
                return client.id === metricClientId ? {
                    ...client,
                    projects: client.projects.map(project => {
                        return project.id === metricProjectId ? {
                            ...project,
                            workOrders: project.workOrders.map(order => {
                                return order.dispatchRequestWorkOrderId === metricWorkOrderId ? {
                                    ...order,
                                    invoiceExtraMetrics: order.invoiceExtraMetrics.map(metric => {
                                        const quantity = metricProperty == orderProps.QUANTITY ? Number(metricValue) : metric.quantity;
                                        const rate = metricProperty == orderProps.RATE ? Number(metricValue) : metric.rate;

                                        return metric.id == metricId ? {
                                            ...metric,
                                            [metricProperty]: Number(metricValue),
                                            total: quantity * rate
                                        } : metric
                                    })
                                } : order
                            })
                        } : project
                    })
                } : client
            });

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: dataWithUpdatedMetric,
                    paginatedData: dataWithUpdatedMetric.filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                }
            }

        case actionTypes.UPDATE_INVOICE_EXTRA_METRICS_TOTAL:
            const dataWithUpdatedTotal = state.paginatedInvoice.data.map(client => {
                return {
                    ...client,
                    projects: client.projects.map(project => {
                        return {
                            ...project,
                            sumOfTotal: sum(project.workOrders?.flatMap(t => {
                                return [
                                    t?.quantity * t?.rate,
                                    sum(t.invoiceExtraMetrics?.flatMap(i =>
                                        i?.quantity * i?.rate
                                    ))
                                ]
                            })),
                            workOrders: project.workOrders.map(order => {
                                return {
                                    ...order,
                                    invoiceExtraMetrics: order.invoiceExtraMetrics?.map(metric => {
                                        return {
                                            ...metric,
                                            total: metric.quantity * metric.rate
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            });

            return {
                ...state,
                paginatedInvoice: {
                    ...state.paginatedInvoice,
                    data: dataWithUpdatedTotal,
                    paginatedData: dataWithUpdatedTotal.filter((_item, index) => (index >= state.paginatedInvoice.minIndex && index < state.paginatedInvoice.maxIndex))
                }
            };

        case actionTypes.SET_INVOICE_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                invoiceSearchRequest: {
                    ...state.invoiceSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: !!action.payload
                }
            };

        case actionTypes.SET_INITIAL_INVOICE_SEARCH_REQUEST:
            return {
                ...state,
                invoiceSearchRequest: INITIAL_INVOICE_SEARCH_REQUEST,
                paginatedInvoice: {
                    data: [],
                    paginatedData: [],
                    recordsCount: 0,
                    minIndex: 0,
                    current: 1,
                    maxIndex: DEFAULT_PAGE_NUMBER
                }
            };

        case actionTypes.SET_INVOICE_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                invoiceSearchRequest: {
                    ...state.invoiceSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_INVOICE_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                invoiceSearchRequest: {
                    ...state.invoiceSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_INVOICE_SEARCH_REQUEST_DATE_RANGE:
            let dateFrom = action.payload
                ? moment(moment.tz(action.payload[0], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            let dateTo = action.payload
                ? moment(moment.tz(action.payload[1], DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format()
                : null;

            return {
                ...state,
                invoiceSearchRequest: {
                    ...state.invoiceSearchRequest,
                    dateFrom: dateFrom,
                    dateTo: dateTo
                }
            }

        default:
            return state;
    }
}

export default invoiceReducer;