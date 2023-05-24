import axios from 'axios';
import getConfig from "../../app/config";

const GET_BY_SEARCH_REQUEST_ROUTE = '/WorkOrders/search';
const SWITCH_PICK_UP_STATE_ROUTE = '/WorkOrders/update-pickup-state'

class _WorkOrdersManagementService {
    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_BY_SEARCH_REQUEST_ROUTE}`, searchRequestModel);
    };

    switchPickupStatus(id) {
        return axios.post(`${getConfig().apiBaseUrl}${SWITCH_PICK_UP_STATE_ROUTE}`, {
            workOrderId: id
        })
    };
}

const WorkOrdersManagementService = new _WorkOrdersManagementService();
export default WorkOrdersManagementService;