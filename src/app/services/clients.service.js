import axios from 'axios';
import getConfig from "../config";

const CREATE_PROJECT_ROUTE = '/Clients';
const GET_ALL_CLIENTS = '/Clients';
const EDIT_CLIENT = '/Clients';
const DELETE_CLIENT = '/Clients';
const SEARCH_CLIENTS = '/Clients/search';
const SEARCH_BY_REQUEST_ROUTE = '/clients/search-by-request';
const SEARCH_ALL_BY_REQUEST_ROUTE = '/clients/search-all-by-request';

class _ClientsService {
    createClient(clientModel) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_PROJECT_ROUTE}`, clientModel);
    };

    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_ROUTE}`, searchRequestModel);
    };

    searchAllByRequest(searchRequest) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_ALL_BY_REQUEST_ROUTE}`, searchRequest);
    }

    getAllClients() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_ALL_CLIENTS}`);
    };

    editClient(clientModel) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_CLIENT}`, clientModel);
    };

    deleteClient(clientId) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_CLIENT}`, { params: { clientId } });
    };

    searchClients(searchModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_CLIENTS}`, searchModel);
    };
}

const ClientsService = new _ClientsService();
export default ClientsService;