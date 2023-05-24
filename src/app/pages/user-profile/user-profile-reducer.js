/*****************************************INITIAL STATE********************************************/
const INITIAL_STATE = {
    userData: { 
        id: '',
        userName: '',
        email: '',
        fullName: '',
        createdAt: ''
    }
};
/*****************************************ACTION TYPES*********************************************/
const actionTypes = {
    GET_PROFILE_DETAILS: 'GET_PROFILE_DETAILS',
};
/********************************************ACTIONS************************************************/
export const actions = {
    setUserProfile: (values) => ({
        type: actionTypes.GET_PROFILE_DETAILS,
        payload: { values }
    })
}
/*******************************************PROFILE REDUCER******************************************/
const userProfileReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.GET_PROFILE_DETAILS:
            return {
                ...state,
                userData: action.payload.values
            };

        default:
            return state;
    }
}

export default userProfileReducer;