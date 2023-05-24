import axios from 'axios';
import getConfig from "../../app/config";

const GET_STATES_ENDPOINT = '/states';

class _StatesService {
    getAll() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_STATES_ENDPOINT}`);
    }
}

const StatesService = new _StatesService();
export default StatesService;