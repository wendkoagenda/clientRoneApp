import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./app/app";
import { initAppInsights } from "./app/app-insights";
import applyGlobalAxiosInterceptors from "./app/axios.config";
import getConfig, { updateConfiguration } from "./app/config";
import ConfigService from "./app/services/config.service";
import configureStore from "./app/store/store";

const store = configureStore({}/*pass initial state if needed*/);

const render = () => {
    applyGlobalAxiosInterceptors();

    ConfigService.getAppConfig()
        .then(resp => {
            updateConfiguration(resp.data.data);
            initAppInsights(getConfig().applicationInsightsInstrumentKey);

            ReactDOM.render(
                <App store={store} />,
                document.getElementById("root")
            );
        })
}

render();

if (module.hot) {
    module.hot.accept('./app/app', render);
}