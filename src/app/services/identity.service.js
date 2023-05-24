import axios from 'axios';
import getConfig from "../../app/config";
import LocalStorageService from './local-storage.service';

const LOGIN_ENDPOINT = '/identity/login';
const FORGOT_PASSWORD_ENDPOINT = '/identity/forgot-password';
const CHANGE_PASSWORD_ENDPOINT = '/identity/change-password';
export const REFRESH_TOKEN_ENDPOINT = '/identity/refresh';

class _IdentityService {
    refresh(refreshModel) {
        return axios.post(`${getConfig().apiBaseUrl}${REFRESH_TOKEN_ENDPOINT}`, refreshModel);
    }

    changePassword(changePasswordModel) {
        return axios.post(`${getConfig().apiBaseUrl}${CHANGE_PASSWORD_ENDPOINT}`, changePasswordModel);
    }

    login(loginModel) {
        return axios.post(`${getConfig().apiBaseUrl}${LOGIN_ENDPOINT}`, loginModel);
    }

    forgotPassword(forgotPasswordModel) {
        return axios.post(`${getConfig().apiBaseUrl}${FORGOT_PASSWORD_ENDPOINT}`, forgotPasswordModel);
    }

    logout() {
        return LocalStorageService.setIdentityData(null);
    }

    setIdentity(identity) {
        LocalStorageService.setIdentityData(identity);
    }

    getIdentity() {
        return LocalStorageService.getIdentityData();
    }

    updateTokens(tokens) {
        let identity = {
            ...this.getIdentity(),
            token: tokens
        };

        this.setIdentity(identity);
    }

    isAuthenticated() {
        const identity = this.getIdentity();

        return identity && identity.token.accessToken && identity.token.refreshToken;
    }

    isInRoles(roles) {
        const identity = this.getIdentity();

        return identity && identity.user && identity.user.roles &&
            identity.user.roles.filter(x => { return roles.includes(x) }).length > 0;
    }
}

const IdentityService = new _IdentityService();
export default IdentityService;