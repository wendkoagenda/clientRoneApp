let config = {
    apiBaseUrl: API_BASE_URL,
    applicationInsightsInstrumentKey: null
};

export const updateConfiguration = (configuration) => {
    config = { ...config, ...configuration };
};

const getConfig = function () {
    return config;
};

export default getConfig;