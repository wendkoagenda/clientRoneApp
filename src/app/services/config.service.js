import axios from 'axios';
import getConfig from '../config';

const GET_APP_CONFIG_ENDPOINT = '/config/client';

class _ConfigService {
    getAppConfig() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_APP_CONFIG_ENDPOINT}`);
    }
}

const ConfigService = new _ConfigService();
export default ConfigService;