/*****************************************INITIAL STATE********************************************/
export const INITIAL_REPORTS_SEARCH_REQUEST = {
    searchCriteria: '',
    sortCriteria: 'id',
    isAscend: false,
    pageNumber: 1,
    projectId: 0,
    pageSize: 200,
    isApproved: false
};

const INITIAL_STATE = {
    loading: false,
    projectId: undefined,
    reports: [],
    editingReport: {},
    editingReportFormData: {},
    reportTestsData: [],
    reportsSearchRequest: INITIAL_REPORTS_SEARCH_REQUEST,
    paginatedReports: {
        data: [],
        pagesCount: 0,
        recordsCount: 0
    },
    projectContacts: [],
    notificationReportRevision: null,
    selectedContactsKeys: [],
    reportsRevisionHistory: []
};
/*****************************************ACTION TYPES*********************************************/
const reducerName = "REPORTS_";
const actionTypes = {
    SET_LOADING_STATE: `${reducerName}SET_LOADING_STATE`,
    SET_PROJECT_ID: `${reducerName}SET_PROJECT_ID`,
    SET_REPORTS: `${reducerName}SET_REPORTS`,
    SET_EDITING_REPORT: `${reducerName}SET_EDITING_REPORT`,
    SET_PAGINATED_REPORTS: `${reducerName}SET_PAGINATED_REPORTS`,
    SET_REPORTS_SEARCH_REQUEST_CRITERIA: `${reducerName}SET_SEARCH_REQUEST_CRITERIA`,
    SET_REPORTS_SEARCH_REQUEST_SORTER: `${reducerName}SET_SEARCH_REQUEST_SORTER`,
    SET_REPORTS_SEARCH_REQUEST_PAGINATION: `${reducerName}SET_SEARCH_REQUEST_PAGINATION`,
    SET_INITIAL_REPORTS_SEARCH_REQUEST: `${reducerName}SET_INITIAL_SEARCH_REQUEST`,
    SET_REPORTS_SEARCH_REQUEST_APPROVED: `${reducerName}SET_SEARCH_REQUEST_APPROVED`,
    SET_REPORTS_SEARCH_REQUEST_PROJECT: `${reducerName}SET_REPORTS_SEARCH_REQUEST_PROJECT`,
    SET_PROJECT_CONTACTS: `${reducerName}SET_PROJECT_CONTACTS`,
    SET_DEFAULT_PAGE_STATE: `${reducerName}SET_DEFAULT_PAGE_STATE`,
    SET_NOTIFICATION_REVISION: `${reducerName}SET_NOTIFICATION_REVISION`,
    SET_SELECTED_CONTACTS_KEYS: `${reducerName}SET_SELECTED_CONTACTS_KEYS`,
    SET_ALL_SELECTED_CONTACT_KEYS: `${reducerName}SET_ALL_SELECTED_CONTACT_KEYS`,
    SET_REVISION_REPORT: `${reducerName}SET_REVISION_REPORT`,
    SET_REPORTS_REVISION_HISTORY: `${reducerName}SET_REPORTS_REVISION_HISTORY`,
    SET_EDITING_REPORT_FORM_DATA: `${reducerName}SET_EDITING_REPORT_FORM_DATA`,
    APPROVE_EDITING_REPORT: `${reducerName}APPROVE_EDITING_REPORT`,
    SET_TESTS_DATA_FORM: `${reducerName}SET_TESTS_DATA_FORM`
};
/********************************************ACTIONS************************************************/
export const actions = {
    setLoadingState: (value) => ({
        type: actionTypes.SET_LOADING_STATE,
        payload: { value }
    }),
    setProjectId: (value) => ({
        type: actionTypes.SET_PROJECT_ID,
        payload: { value }
    }),
    setReports: (values) => ({
        type: actionTypes.SET_REPORTS,
        payload: { values }
    }),
    setEditingReport: (values) => ({
        type: actionTypes.SET_EDITING_REPORT,
        payload: { values }
    }),
    setPaginatedReports: (value) => ({
        type: actionTypes.SET_PAGINATED_REPORTS,
        payload: value
    }),
    setReportsSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_REPORTS_SEARCH_REQUEST_CRITERIA,
        payload: value
    }),
    setInitialReportsSearchRequest: () => ({
        type: actionTypes.SET_INITIAL_REPORTS_SEARCH_REQUEST
    }),
    setReportsSearchRequestSorter: (value) => ({
        type: actionTypes.SET_REPORTS_SEARCH_REQUEST_SORTER,
        payload: value
    }),
    setReportsSearchRequestPagination: (value) => ({
        type: actionTypes.SET_REPORTS_SEARCH_REQUEST_PAGINATION,
        payload: value
    }),
    setReportsSearchRequestApproved: (value) => ({
        type: actionTypes.SET_REPORTS_SEARCH_REQUEST_APPROVED,
        payload: value
    }),
    setReportsSearchRequestProject: (value) => ({
        type: actionTypes.SET_REPORTS_SEARCH_REQUEST_PROJECT,
        payload: value
    }),
    setProjectContacts: (value) => ({
        type: actionTypes.SET_PROJECT_CONTACTS,
        payload: value
    }),
    setNotificationReportRevision: (value) => ({
        type: actionTypes.SET_NOTIFICATION_REVISION,
        payload: value
    }),
    setSelectedContacts: (value) => ({
        type: actionTypes.SET_SELECTED_CONTACTS_KEYS,
        payload: value
    }),
    setRevisionReport: (value) => ({
        type: actionTypes.SET_REVISION_REPORT,
        payload: value
    }),
    setDefaultPageState: () => ({
        type: actionTypes.SET_DEFAULT_PAGE_STATE
    }),
    setAllSelectedContacts: (dispatchRequestWorkOrderId, values) => ({
        type: actionTypes.SET_ALL_SELECTED_CONTACT_KEYS,
        payload: { dispatchRequestWorkOrderId, values }
    }),
    setReportsRevisionHistory: (dispatchRequestWorkOrderId, values) => ({
        type: actionTypes.SET_REPORTS_REVISION_HISTORY,
        payload: { dispatchRequestWorkOrderId, values }
    }),
    setEditingReportFormData: (value) => ({
        type: actionTypes.SET_EDITING_REPORT_FORM_DATA,
        payload: value
    }),
    approveEditingReport: () => ({
        type: actionTypes.APPROVE_EDITING_REPORT
    }),
    setReportTestsData: (values) => ({
        type: actionTypes.SET_TESTS_DATA_FORM,
        payload: values
    })
}
/*******************************************PROFILE REDUCER******************************************/
const reportsReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_PAGINATED_REPORTS:
            return {
                ...state,
                paginatedReports: action.payload
            };

        case actionTypes.APPROVE_EDITING_REPORT:
            return {
                ...state,
                editingReport: {
                    ...state.editingReport,
                    isApproved: true
                }
            }

        case actionTypes.SET_EDITING_REPORT_FORM_DATA:
            return {
                ...state,
                editingReportFormData: action.payload
            }

        case actionTypes.SET_TESTS_DATA_FORM:
            return {
                ...state,
                reportTestsData: action.payload
            }

        case actionTypes.SET_REPORTS_REVISION_HISTORY:
            const isLoaded = state.reportsRevisionHistory.some(item => item.dispatchRequestWorkOrderId == action.payload.dispatchRequestWorkOrderId);

            return {
                ...state,
                reportsRevisionHistory: isLoaded ? state.reportsRevisionHistory.map(item => {
                    if (item.dispatchRequestWorkOrderId == action.payload.dispatchRequestWorkOrderId) {
                        return {
                            dispatchRequestWorkOrderId: action.payload.dispatchRequestWorkOrderId,
                            history: action.payload.values
                        }
                    } else {
                        return item;
                    }
                }) : [...state.reportsRevisionHistory, {
                    dispatchRequestWorkOrderId: action.payload.dispatchRequestWorkOrderId,
                    history: action.payload.values
                }]
            }

        case actionTypes.SET_REPORTS_SEARCH_REQUEST_APPROVED:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    isApproved: action.payload,
                }
            }

        case actionTypes.SET_REPORTS_SEARCH_REQUEST_PROJECT:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    projectId: action.payload,
                }
            }

        case actionTypes.SET_REPORTS_SEARCH_REQUEST_CRITERIA:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    searchCriteria: action.payload,
                    isFiltered: action.payload != '' ? true : state.reportsSearchRequest.isFiltered
                }
            };

        case actionTypes.SET_INITIAL_REPORTS_SEARCH_REQUEST:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    projectId: state.reportsSearchRequest.projectId
                }
            };

        case actionTypes.SET_REPORTS_SEARCH_REQUEST_SORTER:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    isAscend: action.payload.isAscend,
                    sortCriteria: action.payload.sortCriteria
                }
            };

        case actionTypes.SET_REPORTS_SEARCH_REQUEST_PAGINATION:
            return {
                ...state,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    pageNumber: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                }
            };

        case actionTypes.SET_LOADING_STATE:
            return {
                ...state,
                loading: action.payload.value
            }

        case actionTypes.SET_PROJECT_ID:
            return {
                ...state,
                projectId: action.payload.value
            }

        case actionTypes.SET_REPORTS:
            return {
                ...state,
                reports: action.payload.values
            }

        case actionTypes.SET_EDITING_REPORT:
            return {
                ...state,
                editingReportFormData: action.payload.values.jsonData,
                editingReport: action.payload.values
            }

        case actionTypes.SET_PROJECT_CONTACTS:
            return {
                ...state,
                projectContacts: action.payload
            }

        case actionTypes.SET_NOTIFICATION_REVISION:
            return {
                ...state,
                notificationReportRevision: action.payload
            }

        case actionTypes.SET_ALL_SELECTED_CONTACT_KEYS:
            return {
                ...state,
                selectedContactsKeys: [...state.selectedContactsKeys, {
                    dispatchRequestWorkOrderId: action.payload.dispatchRequestWorkOrderId,
                    selectedKeys: action.payload.values
                }]
            }

        case actionTypes.SET_SELECTED_CONTACTS_KEYS:
            const isExist = state.selectedContactsKeys.find(item => item.dispatchRequestWorkOrderId == action.payload.dispatchRequestWorkOrderId);
            return {
                ...state,
                selectedContactsKeys: isExist ? state.selectedContactsKeys.map(item => {
                    if (item.dispatchRequestWorkOrderId == action.payload.dispatchRequestWorkOrderId) {
                        return {
                            ...item,
                            selectedKeys: action.payload.isSelected
                                ? [...item.selectedKeys, action.payload.id]
                                : item.selectedKeys.filter(i => i !== action.payload.id)
                        }
                    } else {
                        return item;
                    }
                }) : [...state.selectedContactsKeys, {
                    dispatchRequestWorkOrderId: action.payload.dispatchRequestWorkOrderId,
                    selectedKeys: [action.payload.id]
                }]
            }

        case actionTypes.SET_REVISION_REPORT:
            return {
                ...state,
                paginatedReports: {
                    ...state.paginatedReports,
                    data: state.paginatedReports.data.map(item => {
                        if (item.dispatchRequestWorkOrderId !== action.payload.id) {
                            return item;
                        }

                        return {
                            ...item,
                            revisionedAt: action.payload.value.revisionedAt
                        }
                    })
                },
                notificationReportRevision: {
                    ...state.notificationReportRevision,
                    revisionedAt: action.payload.value.revisionedAt
                }
            }

        case actionTypes.SET_DEFAULT_PAGE_STATE:
            return {
                ...INITIAL_STATE,
                reportsSearchRequest: {
                    ...state.reportsSearchRequest,
                    isApproved: state.reportsSearchRequest.isApproved
                }
            }

        default:
            return state;
    }
}

export default reportsReducer;