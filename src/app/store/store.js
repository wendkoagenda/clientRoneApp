import history from "../history";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import createRootReducer from "./reducers/root.reducer";
import thunk from "redux-thunk";

const enhancers = [];

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

    if (devToolsExtension && typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const configureStore = function (initialState) {
    const store = createStore(
        createRootReducer(history), // root reducer with router state
        initialState,
        compose(
            applyMiddleware(
                routerMiddleware(history), // for dispatching history actions,
                thunk
                // ... other middlewares ...
            ),
            ...enhancers
        ),
    )

    return store;
}

export default configureStore;