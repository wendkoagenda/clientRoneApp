import axios from 'axios';
import getConfig from "../config";

const GET_MANAGE_INVOICES_BY_SEARCH_REQUEST = '/invoice/manage/search-by-request';
const UPDATE_INVOICE_SCHEDULER_STATUS = '/invoice/manage/update-status';
const DOWNLOAD_INVOICE = (id) => `/invoice/manage/download/${id}`;

class _InvoiceJournalService {
    searchManageInvoiceByRequest(searchRequest) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_MANAGE_INVOICES_BY_SEARCH_REQUEST}`, searchRequest);
    }

    updateInvoiceSchedulerStatus(request) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_INVOICE_SCHEDULER_STATUS}`, request);
    }

    downloadInvoice(id) {
        return axios.get(`${getConfig().apiBaseUrl}${DOWNLOAD_INVOICE(id)}`);
    }
}

const InvoiceJournalService = new _InvoiceJournalService();
export default InvoiceJournalService;