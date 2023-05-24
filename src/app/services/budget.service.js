import axios from 'axios';
import getConfig from "../config";

const SEARCH_PRICING_SHEET_ORDERS = '/PricingSheetManagement/search';
const UPSERT_BUDGET_SHEET_RECORD = '/PricingSheetManagement/upsert';
const CREATE_WORK_ORDER = '/PricingSheetManagement/create';
const GET_PROJECT_BUDGET = (projectId) => `/projectbudget/get/${projectId}`;
const UPSERT_PROJECT_BUDGET = '/projectbudget/upsert';
const UPLOAD_PROJECT_BUDGET = (id) => `/projectbudget/upload-project-budget/${id}`;

class _BudgetService {
    searchPricingSheetOrders(searchRequest) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_PRICING_SHEET_ORDERS}`, searchRequest);
    };

    upsertBudgetSheetRecord(model) {
        return axios.put(`${getConfig().apiBaseUrl}${UPSERT_BUDGET_SHEET_RECORD}`, model);
    };

    getProjectBudget(projectId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROJECT_BUDGET(projectId)}`);
    };

    upsertProjectBudget(model) {
        return axios.put(`${getConfig().apiBaseUrl}${UPSERT_PROJECT_BUDGET}`, model);
    };

    createWorkOrder(model) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_WORK_ORDER}`, model);
    };

    uploadProjectBudget(id, file) {
        const form = new FormData();
        form.append("projectBudgetFile", file);

        return axios({
            method: 'post',
            url: `${getConfig().apiBaseUrl}${UPLOAD_PROJECT_BUDGET(id)}`,
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        });
    }
}

const BudgetService = new _BudgetService();
export default BudgetService;