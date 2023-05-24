import axios from 'axios';
import getConfig from "../../app/config";

const GET_ALL_SITES_ROUTE = '/SitesManagement/search';
const DELETE_SITE_ROUTE = '/sitesManagement/delete';
const CREATE_SITE_ROUTE = '/sitesManagement/create';
const UPDATE_SITE_ROUTE = '/sitesManagement/update';

class _SitesService {
    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_ALL_SITES_ROUTE}`, searchRequestModel);
    };

    delete(siteId) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_SITE_ROUTE}`, { params: { siteId } });
    };

    create(request) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_SITE_ROUTE}`, request);
    };

    update(request) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_SITE_ROUTE}`, request);
    };
}

const SitesService = new _SitesService();
export default SitesService;