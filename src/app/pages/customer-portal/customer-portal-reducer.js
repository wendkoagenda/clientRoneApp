/*****************************************INITIAL STATE********************************************/
const INITIAL_STATE = {
    customer: null,
    projects: [],
};
/*****************************************ACTION TYPES*********************************************/
const reducerName = "CUSTOMER_PORTAL_";
const actionTypes = {
    SET_PROJECTS: `${reducerName}SET_PROJECTS`,
    SET_ASSIGNED_PROJECTS: `${reducerName}SET_ASSIGNED_PROJECTS`,
    ASSIGN_PROJECT: `${reducerName}ASSIGN_PROJECT`,
    REMOVE_PROJECT: `${reducerName}REMOVE_PROJECT`,
    SET_CUSTOMER: `${reducerName}SET_CUSTOMER`,
};
/********************************************ACTIONS************************************************/
export const actions = {
    assignProject: (value) => ({
        type: actionTypes.ASSIGN_PROJECT,
        payload: value
    }),
    removeProject: (value) => ({
        type: actionTypes.REMOVE_PROJECT,
        payload: value
    }),
    setProjects: (value) => ({
        type: actionTypes.SET_PROJECTS,
        payload: value
    }),
    setAssignedProjects: (value) => ({
        type: actionTypes.SET_ASSIGNED_PROJECTS,
        payload: value
    }),
    setCustomer: (value) => ({
        type: actionTypes.SET_CUSTOMER,
        payload: value
    })
}
/**************************************CUSTOMER PORTAL REDUCER**************************************/
const customerPortalReducer = function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case actionTypes.SET_CUSTOMER:
            return {
                ...state,
                customer: action.payload
            };

        case actionTypes.SET_PROJECTS:
            return {
                ...state,
                projects: action.payload
            };

        case actionTypes.ASSIGN_PROJECT:
            return {
                ...state,
                customer: {
                    ...state.customer,
                    projects:[...state.customer.projects, 
                        state.projects.filter(p => p.id === action.payload.projectId).length
                            && state.projects.filter(p => p.id === action.payload.projectId)[0]            
                        ]
                }   
            };
            
        case actionTypes.REMOVE_PROJECT:
            return {
                ...state,
                customer: {
                    ...state.customer,
                    projects:[...state.customer.projects.filter(p => p.id != action.payload)]
                }   
            };
        default:
            return state;
    }
}

export default customerPortalReducer;