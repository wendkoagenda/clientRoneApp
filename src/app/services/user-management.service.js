import axios from 'axios';
import getConfig from "../../app/config";

const GET_ALL_USERS_ENDPOINT = '/Users';
const GET_USER_BY_ID = (id) => { return `/Users/${id}` };
const EDIT_USER_ENDPOINT = '/Users';
const CREATE_USER_ENDPOINT = '/admin/register-user';
const DELETE_USER_ENDPOINT = '/Users';
const GET_MANAGERS_ENDPOINT = '/Users/project-managers';
const GET_PROJECT_RESPONSIBLE_PERSONS_ROUTE = '/ProjectResponsiblePerson';
const EDIT_USER_SITES = '/Users/edit-sites'
const CHANGE_USER_DISABLED_STATE = (userId) => `/Admin/change-disabled-state/${userId}`;
const CHANGE_USER_CANSYNC_STATE = (userId) => `/Admin/change-cansync-state/${userId}`;
const SEARCH_BY_REQUEST_ENDPOINT = '/Users/search-by-request';

class _UserManagementService {
    getAllUsers() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_ALL_USERS_ENDPOINT}`);
    }

    editUser(editUserModel) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_USER_ENDPOINT}`, editUserModel);
    }

    createUser(createUserModel) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_USER_ENDPOINT}`, createUserModel);
    }

    deleteUser(userId) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_USER_ENDPOINT}`, { params: { userId } });
    }

    getProjectManagers() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_MANAGERS_ENDPOINT}`);
    }

    getProjectResponsiblePersons() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROJECT_RESPONSIBLE_PERSONS_ROUTE}`);
    }

    editUserSites(editModel) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_USER_SITES}`, editModel);
    }

    changeUserDisabledState(userId) {
        return axios.put(`${getConfig().apiBaseUrl}${CHANGE_USER_DISABLED_STATE(userId)}`);
    }

    changeUserCanSyncState(userId) {
        return axios.put(`${getConfig().apiBaseUrl}${CHANGE_USER_CANSYNC_STATE(userId)}`);
    }

    searchByRequest(searchByRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_ENDPOINT}`, searchByRequestModel);
    }
}

const UserManagement = new _UserManagementService();
export default UserManagement;