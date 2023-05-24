import axios from 'axios';
import getConfig from "../../app/config";

const GET_MODULES_ENDPOINT = '/Journal/filters';
const GET_JOURNAL_ACTIVITY = '/Journal/search';
const RESTORE_CLIENT = '/journal/restore/client';
const RESTORE_PROJECT = '/journal/restore/project';
const RESTORE_DISPATCH = '/journal/restore/dispatch-request';
const RESTORE_SITE = '/journal/restore/site';

class _JournalService {
    getSearchFilters() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_MODULES_ENDPOINT}`);
    }

    getJournalActivity(searchCriteriaModel) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_JOURNAL_ACTIVITY}`, searchCriteriaModel);
    }

    restoreClient(clientId) {
        return axios.put(`${getConfig().apiBaseUrl}${RESTORE_CLIENT}/${clientId}`);
    }

    restoreProject(projectId) {
        return axios.put(`${getConfig().apiBaseUrl}${RESTORE_PROJECT}/${projectId}`);
    }

    restoreDispatch(dispatchId) {
        return axios.put(`${getConfig().apiBaseUrl}${RESTORE_DISPATCH}/${dispatchId}`);
    }

    restoreSite(siteId) {
        return axios.put(`${getConfig().apiBaseUrl}${RESTORE_SITE}/${siteId}`);
    }
}

const JournalService = new _JournalService();
export default JournalService;