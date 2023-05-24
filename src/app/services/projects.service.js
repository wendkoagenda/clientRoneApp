import axios from 'axios';
import getConfig from "../../app/config";

const GET_PROJECTS_ROUTE = '/Projects';
const GET_PROJECT_BY_ID_ROUTE = '/Projects/'
const EDIT_PROJECT_ROUTE = '/projects';
const CREATE_PROJECT_ROUTE = '/Projects';
const DELETE_PROJECT_ROUTE = '/Projects';
const SEARCH_PROJECTS = '/Projects/search';
const SEARCH_BY_REQUEST_ROUTE = '/projects/search-by-request';
const GET_BUDGET_COMPARISON = '/BudgetComparison/get-budget-comparison';
const EXPORT_BUDGET_COMPARISON = '/BudgetComparison/export';
const GET_PROJECT_CONTACTS_REPORT_DISTRIBUTION = '/workorderreport/work-order-project-contacts-notifications/get-all';
const UPSERT_PROJECT_CONTACTS_REPORT_DISTRIBUTION = '/workorderreport/work-order-project-contacts-notifications/upsert';
const ADD_PROJECT_CONTACT='/Projects/add-project-contact';

class _ProjectsService {
    getProjects() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROJECTS_ROUTE}`);
    };

    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_ROUTE}`, searchRequestModel);
    };

    getProjectById(projectId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROJECT_BY_ID_ROUTE}${projectId}`);
    };

    createProject(projectModel) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_PROJECT_ROUTE}`, projectModel);
    };

    editProject(projectModel) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_PROJECT_ROUTE}`, projectModel)
    };

    deleteProject(projectId) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_PROJECT_ROUTE}`, { params: { projectId } })
    };

    searchProjects(searchModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_PROJECTS}`, searchModel);
    };

    getBudgetComparison(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_BUDGET_COMPARISON}`, model);
    }

    exportBudgetComparison(model) {
        return axios.post(`${getConfig().apiBaseUrl}${EXPORT_BUDGET_COMPARISON}`, model, { responseType: 'blob' });
    }

    getProjectContactReportDistribution(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_PROJECT_CONTACTS_REPORT_DISTRIBUTION}`, model);
    }

    upsertProjectContactReportDistribution(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPSERT_PROJECT_CONTACTS_REPORT_DISTRIBUTION}`, model);
    }

    addProjectContact(model) {
        return axios.post(`${getConfig().apiBaseUrl}${ADD_PROJECT_CONTACT}`, model);
    }
}

const ProjectsService = new _ProjectsService();
export default ProjectsService;