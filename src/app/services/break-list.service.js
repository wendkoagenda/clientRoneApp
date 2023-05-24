import axios from 'axios';
import getConfig from "../config";

const GET_CONCRETE_BREAK_LIST_BY_REQUEST = '/BreakList/concrete-search';
const UPDATE_CONCRETE_TESTED_BY = '/BreakList/update/concrete-tested-by';
const EXPORT_CONCRETE_BREAK_LIST = '/BreakList/concrete-export';
const GET_SOIL_BREAK_LIST_BY_REQUEST = '/BreakList/soil-search';
const EXPORT_SOIL_BREAK_LIST = '/BreakList/soil-export';
const UPDATE_CONCRETE_SPEC_INFO = '/Technician/add-specimen-info';
const UPDATE_SOIL_SPEC_INFO = '/Technician/add-soil-specimens-info';
const GET_CONCRETE_BREAK_LIST_BY_DATE = '/BreakList/concrete-search-by-date';
const EXPORT_CONCRETE_BREAK_LIST_BY_DATE = '/BreakList/concrete-export-by-date';
const UPDATE_MULTIPLE_TESTED_BY = '/Technician/update-multiple-tested-by';

class _BreakListService {
    searchAllConcreteByRequest(searchRequest) { 
        return axios.post(`${getConfig().apiBaseUrl}${GET_CONCRETE_BREAK_LIST_BY_REQUEST}`, searchRequest);
    }

    updateConcreteTestedBy(updateModel) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_CONCRETE_TESTED_BY}`, updateModel);
    }

    exportConcreteBreakList(dateRange) {
        return axios.post(`${getConfig().apiBaseUrl}${EXPORT_CONCRETE_BREAK_LIST}`, dateRange);
    }

    searchAllSoilByRequest(searchRequest) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_SOIL_BREAK_LIST_BY_REQUEST}`, searchRequest);
    }

    exportSoilBreakList(dateRange) {
        return axios.post(`${getConfig().apiBaseUrl}${EXPORT_SOIL_BREAK_LIST}`, dateRange);
    }

    updateConcreteSpecInfo(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_CONCRETE_SPEC_INFO}`, model);
    }

    updateSoilSpecInfo(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_SOIL_SPEC_INFO}`, model);
    }

    exportConcreteBreakListByDate(date, reportTypeId) {
        return axios.post(`${getConfig().apiBaseUrl}${EXPORT_CONCRETE_BREAK_LIST_BY_DATE}`, date, reportTypeId);
    }

    updateMultipleTestedBy(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_MULTIPLE_TESTED_BY}`, model);
    }
}

const BreakListService = new _BreakListService();
export default BreakListService;