import axios from 'axios';
import getConfig from "../../app/config";

const GET_CUSTOMERS_ROUTE = '/CustomerPortal';
const SEARCH_BY_REQUEST_ROUTE = '/CustomerPortal/search-by-request';
const SEARCH_BY_ID_ROUTE = '/CustomerPortal/search-by-id';
const ASSIGN_PROJECTS_ROUTE = '/CustomerPortal/assign-projects';
const GET_ASSIGNED_PROJECTS ='/CustomerPortal/assigned-projects-by-request';
const GET_PROJECT_BY_ID_ROUTE = '/CustomerPortal/project-by-id';
const GET_REPORT_LIST_BY_REQUEST = '/CustomerPortal/work-order-reports';
const GET_REPORT_BY_ID = '/CustomerPortal/work-order-report/'
const PREVIEW_REPORT = '/CustomerPortal/preview-report';
const DOWNLOAD_REPORT = '/CustomerPortal/download-report/';
const POPULATE_WITH_CUSTOMERS = '/CustomerPortal/add-all-contacts-as-customers';
const GET_CONCRETE_TEST = (id) => `/CustomerPortal/concrete-full-specimens-info/${id}`;
const GET_SOIL_TEST = (id) => `/CustomerPortal/soil-full-specimens-info/${id}`;

class _CustomerPortalService {
    getCustomers() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_CUSTOMERS_ROUTE}`);
    };

    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_ROUTE}`, searchRequestModel);
    };

    searchById(userId) {
        return axios.get(`${getConfig().apiBaseUrl}${SEARCH_BY_ID_ROUTE}`, { params: { userId } });
    };

    assignProjects(model) {
        return axios.post(`${getConfig().apiBaseUrl}${ASSIGN_PROJECTS_ROUTE}`, model);
    };

    getAssignedProjects(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_ASSIGNED_PROJECTS}`, model);
    };

    getProjectById(projectId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROJECT_BY_ID_ROUTE}`, { params: { projectId }});
    };

    getReportListByRequest(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_REPORT_LIST_BY_REQUEST}`, model);
    };

    getReportListRelatedToProject(model, projectId) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_REPORT_LIST_BY_REQUEST}`, {...model, projectId});
    };

    getReportById(workOrderId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_REPORT_BY_ID}${workOrderId}`);
    };

    getConcreteTestInfoById(dispatchRequestWorkOrderId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_CONCRETE_TEST(dispatchRequestWorkOrderId)}`);
    };

    getSoilTestInfoById(dispatchRequestWorkOrderId){
        return axios.get(`${getConfig().apiBaseUrl}${GET_SOIL_TEST(dispatchRequestWorkOrderId)}`);
    }

    previewReport(model) {
        return axios.post(`${getConfig().apiBaseUrl}${PREVIEW_REPORT}`, model);
    }

    downloadReport(reportId) {
        return axios.get(`${getConfig().apiBaseUrl}${DOWNLOAD_REPORT}${reportId}`);
    }

    populateWithCustomers() {
        return axios.get(`${getConfig().apiBaseUrl}${POPULATE_WITH_CUSTOMERS}`);
    }
}

const CustomerPortalService = new _CustomerPortalService();
export default CustomerPortalService;