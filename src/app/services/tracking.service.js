import { getAppInsights } from "../app-insights";
import { v4 as uuidv4 } from "uuid";
import { SeverityLevel } from "@microsoft/applicationinsights-common";

class _TrackingService {
    trackEvent(name, properties = {}) {
        const eventTelemetry = {
            name
        };

        getAppInsights().trackEvent(eventTelemetry, properties);
    }

    trackException(errorObject, severityLevel = SeverityLevel.Error, properties = {}) {
        const exceptionTelemetry = {
            id: uuidv4(),
            exception: errorObject,
            severityLevel
        };

        getAppInsights().trackException(exceptionTelemetry, properties);
    }

    trackTrace(message, severityLevel, properties) {
        const traceTelemetry = {
            message,
            severityLevel
        };

        getAppInsights().trackTrace(traceTelemetry, properties);
    }

    trackMetric(name, average, sampleCount, min, max, properties) {
        const metricTelemetry = {
            name,
            average,
            sampleCount,
            min,
            max
        };

        getAppInsights().trackMetric(metricTelemetry, properties);
    }

    trackPageView(name, uri, refUri, pageType, isLoggedIn, duration,
        pageViewProperties, customProperties) {
        const pageViewTelemetry = {
            name,
            uri,
            refUri,
            pageType,
            isLoggedIn,
            properties: {
                duration,
                pageViewProperties
            }
        };

        getAppInsights().trackPageView(pageViewTelemetry, customProperties);
    }

    startTrackEvent(name) {
        getAppInsights().startTrackEvent(name);
    }

    stopTrackEvent(name, properties, measurments) {
        getAppInsights().stopTrackEvent(name, properties, measurments);
    }

    startTrackPage(name) {
        getAppInsights().startTrackPage(name);
    }

    stopTrackPage(name, url, properties, measurments) {
        getAppInsights().stopTrackPage(name, url, properties, measurments);
    }
}

export const getErrorMessage = (error, defaultMessage) => {
    if (error && error.response && error.response.data) {
        if (error.response.data.title) {
            return error.response.data.title;
        }

        if (error.response.data.message) {
            return error.response.data.message;
        }

        return defaultMessage;
    }

    return defaultMessage;
}

const TrackingService = new _TrackingService();
export default TrackingService;