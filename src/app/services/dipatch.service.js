import axios from 'axios';
import getConfig from "../../app/config";

const GET_WORK_ORDERS_ROUTE = '/DispatchProcess';
const GET_ALL_WORK_ORDERS_ROUTE = '/WorkOrders';
const CREATE_DISPATCH_ROUTE = '/DispatchRequests';
const DELETE_DISPATCH_ROUTE = '/DispatchRequests';
const GET_DISPATCHES_ROUTE = '/DispatchRequests';
const EDIT_DISPATCH_ROUTE = '/DispatchRequests';
const GET_TECHNICIANS_ROUTE = '/TechnicianLocation';
const GET_BY_ID_DISPATCH_ROUTE = '/DispatchRequests';
const GET_BY_PROJECT_ID_ROUTE = '/DispatchProcess/search-by-project';
const ASSIGN_WORK_ORDER_ROUTE = '/DispatchProcess/assign';
const SEND_WORK_ORDER_NOTIFICATION_ROUTE = '/DispatchProcess/send-notification';
const CHANGE_WORK_ORDER_ROUTE = '/DispatchProcess/change';
const CANCEL_WORK_ORDER_ROUTE = '/DispatchProcess/cancel';
const SEARCH_BY_REQUEST_ROUTE = '/DispatchRequests/search-by-request';
const SEARCH_WORK_ORDERS_BY_REQUEST_ROUTE = '/DispatchProcess/search-by-request';
const EXPORT_WORK_ORDERS_ROUTE = '/DispatchProcess/export';
const GET_COMPLETED_WORK_ORDERS_BY_SELECTED_DATE_ROUTE = '/DispatchProcess/completed-work-orders';
const CHANGE_TRANSPORTATION_CHARGE_ID = `${CHANGE_WORK_ORDER_ROUTE}/transportation-status`

class _DispatchService {
    searchWorkOrderByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_WORK_ORDERS_BY_REQUEST_ROUTE}`, searchRequestModel);
    };

    searchByRequest(searchRequestModel) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_ROUTE}`, searchRequestModel);
    };

    getWorkOrders() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_WORK_ORDERS_ROUTE}`);
    };

    getAllWorkOrder() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_ALL_WORK_ORDERS_ROUTE}`);
    };

    getDispatches() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_DISPATCHES_ROUTE}`);
    };

    deleteDispatchRequest(id) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_DISPATCH_ROUTE}`, { params: { id } });
    };

    getTechnicians() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_TECHNICIANS_ROUTE}`);
    };

    createDispatchRequest(model) {
        return axios.post(`${getConfig().apiBaseUrl}${CREATE_DISPATCH_ROUTE}`, model);
    };

    editDispatchRequest(model) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_DISPATCH_ROUTE}`, model);
    };

    getByProjectId(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_BY_PROJECT_ID_ROUTE}/${id}`);
    };

    getById(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_BY_ID_DISPATCH_ROUTE}/${id}`);
    };

    assignWorkOrder(WorkOrderModel) {
        return axios.post(`${getConfig().apiBaseUrl}${ASSIGN_WORK_ORDER_ROUTE}`, WorkOrderModel);
    };

    sendNotification(model) {
        return axios.post(`${getConfig().apiBaseUrl}${SEND_WORK_ORDER_NOTIFICATION_ROUTE}`, model);
    };

    changeWorkOrder(model) {
        return axios.put(`${getConfig().apiBaseUrl}${CHANGE_WORK_ORDER_ROUTE}`, model);
    };

    cancelWorkOrder(model) {
        return axios.put(`${getConfig().apiBaseUrl}${CANCEL_WORK_ORDER_ROUTE}`, model);
    };

    exportWorkOrders() {
        return axios.get(`${getConfig().apiBaseUrl}${EXPORT_WORK_ORDERS_ROUTE}`);
    };

    getCompletedWorkOrdersBySelectedDate(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_COMPLETED_WORK_ORDERS_BY_SELECTED_DATE_ROUTE}`, model);
    };

    changeTransportationChargeId(model) {
        return axios.put(`${getConfig().apiBaseUrl}${CHANGE_TRANSPORTATION_CHARGE_ID}`, model);
    }
}

const DispatchService = new _DispatchService();
export default DispatchService;