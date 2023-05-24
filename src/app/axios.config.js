import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import IdentityService, { REFRESH_TOKEN_ENDPOINT } from './services/identity.service';
import history from './history';
import routes from './pages/routes';


const configureRefreshTokenInterceptor = () => {
    axios.interceptors.response.use(
        response => response,
        async function (error) {
            if (isTokensRelatedError(error)) {
                return await handleTokensRelatedError(error);
            }

            return Promise.reject(error);
        }
    );

    const isTokensRelatedError = (error) => {
        return error.response &&
            ((error.response.headers && error.response.headers['token-expired']) || (error.response.config.url.endsWith(REFRESH_TOKEN_ENDPOINT)));
    }

    let refreshInProgress = false;
    let requestsQueue = [];

    const addRequestToQueue = (callback) => {
        requestsQueue.push(callback);
    };

    const onRefreshFinished = (refreshToken) => {
        requestsQueue.forEach(requestCallback => requestCallback(refreshToken));
        requestsQueue = [];
    };

    const handleTokensRelatedError = async (error) => {
        if (!error || !error.response) {
            return Promise.reject(error);
        }

        const originalRequest = error.response.config;

        if (error.response.status !== StatusCodes.OK && originalRequest.url.endsWith(REFRESH_TOKEN_ENDPOINT)) {
            IdentityService.logout();
            history.push(routes.LOGIN);
            return Promise.reject(error);
        }

        const retryOriginalRequest = new Promise(resolve => {
            addRequestToQueue(refreshToken => {
                originalRequest.headers.Authorization = 'Bearer ' + refreshToken;
                resolve(axios(originalRequest));
            });
        });

        if (error.response.status === StatusCodes.UNAUTHORIZED && !refreshInProgress) {
            refreshInProgress = true;

            const identity = IdentityService.getIdentity();
            if (!identity || !originalRequest) {
                return Promise.reject(error);
            }

            const response = await IdentityService.refresh({
                email: identity.user.email,
                refreshToken: identity.token.refreshToken
            });

            IdentityService.updateTokens(response.data.data);

            refreshInProgress = false;
            onRefreshFinished(response.data.data.accessToken);
        }

        return retryOriginalRequest;
    };
}

const configureRequestInterceptors = function () {
    axios.interceptors.request.use(function (config) {
        const identity = IdentityService.getIdentity();

        if (identity && identity.token && identity.token.accessToken) {
            config.headers.Authorization = 'Bearer ' + identity.token.accessToken;
        }

        return config;
    }, function (error) {
        return Promise.reject(error);
    });
}

const applyGlobalAxiosInterceptors = function () {
    configureRequestInterceptors();
    configureRefreshTokenInterceptor();
};

export default applyGlobalAxiosInterceptors;