import axios from 'axios';
import getConfig from "../../app/config";

const GET_ALL_SITES = '/Sites';
const GET_ALL_ROLES = '/Roles';

class _GlobalService {
    getAllSites() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_ALL_SITES}`);
    };

    getAllRoles() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_ALL_ROLES}`);
    };
}

const GlobalService = new _GlobalService();
export default GlobalService;