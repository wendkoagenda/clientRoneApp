/***************************************** INITIAL STATE ********************************************/
const INITIAL_SITES_SEARCH_REQUEST = {
    sortCriteria: 'id',
    isAscend: true,
};

const INITIAL_STATE = {
    sitesSearchRequest: INITIAL_SITES_SEARCH_REQUEST,
    sites: [],
    manageModalVisible: false,
    manageModalEditMode: false,
    editSiteModel: null
};

/***************************************** ACTION TYPES *********************************************/
const reducerName = "SITES_MANAGEMENT_";
const actionTypes = {
    SET_SITES: `${reducerName}SET_SITES`,
    SET_SITES_SEARCH_REQUEST: `${reducerName}SET_SITES_SEARCH_REQUEST`,
    SET_IS_MANAGE_MODAL_VISIBLE: `${reducerName}SET_IS_MANAGE_MODAL_VISIBLE`,
    SET_MANAGE_MODAL_EDIT_MODE: `${reducerName}SET_MANAGE_MODAL_EDIT_MODE`,
    SET_EDIT_SITE_MODEL: `${reducerName}SET_EDIT_SITE_MODEL`,
    SET_INITIAL_SEARCH_CRITERIA: `${reducerName}SET_INITIAL_SEARCH_REQUEST_CRITERIA`
};

/******************************************** ACTIONS ***********************************************/
export const actions = {
    setSites: (value) => ({
        type: actionTypes.SET_SITES,
        payload: value
    }),
    setSitesSearchRequestCriteria: (value) => ({
        type: actionTypes.SET_SITES_SEARCH_REQUEST,
        payload: value
    }),
    setIsManageModalVisible: (value) => ({
        type: actionTypes.SET_IS_MANAGE_MODAL_VISIBLE,
        payload: value
    }),
    setManageModalEditMode: (value) => ({
        type: actionTypes.SET_MANAGE_MODAL_EDIT_MODE,
        payload: value
    }),
    setEditSiteModel: (value) => ({
        type: actionTypes.SET_EDIT_SITE_MODEL,
        payload: value
    }),
    setInitialSearchCriteria: () => ({
        type: actionTypes.SET_INITIAL_SEARCH_CRITERIA
    })
}

/******************************************* REDUCER ************************************************/
const sitesManagementReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_SITES:
            return {
                ...state,
                sites: action.payload
            };

        case actionTypes.SET_SITES_SEARCH_REQUEST:
            return {
                ...state,
                sitesSearchRequest: action.payload
            };

        case actionTypes.SET_IS_MANAGE_MODAL_VISIBLE:
            return {
                ...state,
                manageModalVisible: action.payload
            };

        case actionTypes.SET_MANAGE_MODAL_EDIT_MODE:
            return {
                ...state,
                manageModalEditMode: action.payload
            };

        case actionTypes.SET_EDIT_SITE_MODEL:
            return {
                ...state,
                editSiteModel: action.payload
            };

        case actionTypes.SET_INITIAL_SEARCH_CRITERIA:
            return {
                ...state,
                sitesSearchRequest: INITIAL_SITES_SEARCH_REQUEST
            }

        default:
            return state;
    }
}

export default sitesManagementReducer;