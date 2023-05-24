import axios from 'axios';
import getConfig from "../../app/config";

const GET_REPORTS_BY_PROJECT = '/WorkOrderReport/search';
const GET_REPORT_BY_ID = '/WorkOrderReport/';
const UPDATE_WORK_ORDER_REPORT = '/WorkOrderReport/update';
const APPROVE_REPORT = '/WorkOrderReport/approve';
const REPORTS_SEARCH_REQUEST = '/WorkOrderReport/search-by-request';
const DOWNLOAD_REPORT = '/WorkOrderReport/download/';
const GET_BY_WORK_ORDER_ID = '/WorkOrderReport/work-order-id';
const DOWNLOAD_NOTIFICATION_REVISION = (id) => `/WorkOrderReport/download-notification-revision/${id}`;
const UPLOAD_NOTIFICATION_REVISION = (id) => `/WorkOrderReport/upload-notification-revision/${id}`;
const SEND_CONTACTS_NOTIFICATIONS = "/WorkOrderReport/send-contacts-notifications";
const GET_NOTIFICATION_CONTACTS = (id) => `/WorkOrderReport/get-notification-contacts/${id}`;
const GET_REVISION_HISTORY = (id) => `/WorkOrderReportStatistic/get-all-by-dispatch-request-work-order-id/${id}`;
const GET_CONCRETE_TEST = (id) => `/Lab/concrete-full-specimens-info/${id}`;
const GET_REVISION_HISTORY_BY_ID = (id) => `/WorkOrderReportStatistic/download/${id}`;
const UPSERT_MULTIPLE_SPEC_INFO = '/Technician/add-multiple-specimens-info';
const UPDATE_NOTIFICATION_REVISION_STATUS = '/workorderreport/update-notification-revision-status';
const SEARCH_BY_REQUEST_REPORT_LIST = '/WorkOrderReportList/search-by-request';
const PREVIEW_REPORT = '/WorkOrderReport/preview';
const DELETE_REPORT_ROUTE = '/WorkOrderReport';
const GET_SOIL_TEST = (id) => `/Lab/soil-full-specimens-info/${id}`;

class _ReportsService {
    searchReportListByRequest(model) {
        return axios.post(`${getConfig().apiBaseUrl}${SEARCH_BY_REQUEST_REPORT_LIST}`, model);
    }

    getReportsByProjects(model) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_REPORTS_BY_PROJECT}`, model);
    }

    getReportById(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_REPORT_BY_ID}${id}`);
    }

    getByWorkOrderId(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_BY_WORK_ORDER_ID}/${id}`);
    }

    updateWorkOrderReport(model) {
        return axios.put(`${getConfig().apiBaseUrl}${UPDATE_WORK_ORDER_REPORT}`, model);
    }

    approveReport(model) {
        return axios.put(`${getConfig().apiBaseUrl}${APPROVE_REPORT}`, model);
    }

    getReportsBySearchRequest(model) {
        return axios.post(`${getConfig().apiBaseUrl}${REPORTS_SEARCH_REQUEST}`, model);
    }

    downloadReport(id) {
        return axios.get(`${getConfig().apiBaseUrl}${DOWNLOAD_REPORT}${id}`);
    }

    uploadNotificationRevision(id, file) {
        const form = new FormData();
        form.append("reportFile", file);

        return axios({
            method: 'post',
            url: `${getConfig().apiBaseUrl}${UPLOAD_NOTIFICATION_REVISION(id)}`,
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        });
    }

    downloadNotificationRevision(id) {
        return axios.get(`${getConfig().apiBaseUrl}${DOWNLOAD_NOTIFICATION_REVISION(id)}`);
    }

    sendContactsNotifications(model) {
        return axios.post(`${getConfig().apiBaseUrl}${SEND_CONTACTS_NOTIFICATIONS}`, model);
    }

    loadSelectedContacts(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_NOTIFICATION_CONTACTS(id)}`);
    }

    loadReportRevisionHistory(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_REVISION_HISTORY(id)}`);
    }

    downloadReportRevisionHistoryById(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_REVISION_HISTORY_BY_ID(id)}`);
    }

    getConcreteTestInfoById(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_CONCRETE_TEST(id)}`);
    }

    upsertMultipleSpecInfo(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPSERT_MULTIPLE_SPEC_INFO}`, model);
    }

    updateNotificationRevisionStatus(model) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_NOTIFICATION_REVISION_STATUS}`, model);
    }

    previewReport(model) {
        return axios.post(`${getConfig().apiBaseUrl}${PREVIEW_REPORT}`, model);
    }

    deleteReport(reportId) {
        return axios.delete(`${getConfig().apiBaseUrl}${DELETE_REPORT_ROUTE}`, { params: { reportId } })
    };

    getSoilTestInfoById(id) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_SOIL_TEST(id)}`);
    }
}

const ReportsService = new _ReportsService();
export default ReportsService;