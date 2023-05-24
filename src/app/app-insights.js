import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import history from './history';

const reactPlugin = new ReactPlugin();

let ai = null

export const initAppInsights = (instrumentationKey) => {
    ai = new ApplicationInsights({
        config: {
            instrumentationKey: instrumentationKey,
            //connectionString: 'TODO: PASS CONNECTION STRING IF IT IS USED INSTEAD OF INSTRUMENTATION KEY',
            extensions: [reactPlugin],
            extensionConfig: {
                [reactPlugin.identifier]: { history: history }
            }
        }
    });
    
    ai.loadAppInsights();
}

export const getAppInsights = () => {
    return ai.appInsights;
};

const withAppInsights = (Component, componentName, className) => withAITracking(reactPlugin, Component, componentName, className);
export default withAppInsights;