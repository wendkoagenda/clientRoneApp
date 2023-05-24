const INITIAL_STATE = {
    collapsed: false,
    user: {},
    allSites: [],
    page: {
        sidebarKey: ['1'],
        name: ''
    },
    states: [],
    isRoneLogo: true,
    isGlobalSpinActive: false
};

const actionTypes = {
    AUTHORIZED_LAYOUT_SET_VALUE: 'AUTHORIZED_LAYOUT_SET_VALUE',
    AUTHORIZED_LAYOUT_CLEAR: 'AUTHORIZED_LAYOUT_CLEAR',
    SET_USER_PROFILE_DETAILS: 'SET_USER_PROFILE_DETAILS',
    SET_PAGE_INFO: 'SET_PAGE_INFO',
    SET_STATES: 'SET_STATES',
    SET_GLOBAL_SPIN_STATE: 'SET_GLOBAL_SPIN_STATE'
};

export const actions = {
    setValue: function (name, value) {
        return {
            type: actionTypes.AUTHORIZED_LAYOUT_SET_VALUE,
            payload: { name, value }
        };
    },
    setPageInfo(value) {
        return {
            type: actionTypes.SET_PAGE_INFO,
            payload: value
        }
    },
    setStates(value) {
        return {
            type: actionTypes.SET_STATES,
            payload: value
        }
    },
    setGlobalSpinState(value) {
        return {
            type: actionTypes.SET_GLOBAL_SPIN_STATE,
            payload: { value }
        }
    }
}

const authorizedLayoutReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.AUTHORIZED_LAYOUT_SET_VALUE:
            return {
                ...state,
                [action.payload.name]: action.payload.value
            };

        case actionTypes.SET_GLOBAL_SPIN_STATE:
            return {
                ...state,
                isGlobalSpinActive: action.payload.value
            }

        case actionTypes.AUTHORIZED_LAYOUT_CLEAR:
            return INITIAL_STATE;

        case actionTypes.SET_PAGE_INFO:
            return {
                ...state,
                isRoneLogo: true,
                page: action.payload
            }

        case actionTypes.SET_STATES:
            return {
                ...state,
                states: action.payload
            }

        default:
            return state;
    }
}

export default authorizedLayoutReducer;