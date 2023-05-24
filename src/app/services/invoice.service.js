import axios from 'axios';
import getConfig from "../config";

const GET_INVOICE_LIST_BY_REQUEST = '/Invoice/search-by-request';
const CREATE_INVOICE = '/Invoice';
const GENERATE_INVOICE = '/Invoice/generate';
const GET_SEARCH_FILTERS = '/Invoice/search-filters';
const GET_BY_ID = id => `/Invoice/${id}`;
const UPDATE_INVOICE_INFO = `/Invoice/update-invoice-info`;

class _InvoiceService {
    searchInvoiceByRequest(searchRequest) {
        return axios.post(`${getConfig().apiBaseUrl}${GET_INVOICE_LIST_BY_REQUEST}`, searchRequest);
    }

    getSearchFilters() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_SEARCH_FILTERS}`);
    }

    generateInvoice(invoiceModel) {
        return axios.post(`${getConfig().apiBaseUrl}${GENERATE_INVOICE}`, invoiceModel);
    }

    createInvoice(invoiceFiles, invoiceModel) {
        const form = new FormData();
        form.append("invoice", JSON.stringify(invoiceModel));

        invoiceFiles.forEach(element => {
            form.append("invoiceFiles", element.file, element.fileName);
        });

        return axios({
            method: 'post',
            url: `${getConfig().apiBaseUrl}${CREATE_INVOICE}`,
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        });
    }

    getInvoiceById(invoiceId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_BY_ID(invoiceId)}`);
    }

    updateInvoiceInfo(invoiceInfo) {
        return axios.post(`${getConfig().apiBaseUrl}${UPDATE_INVOICE_INFO}`, invoiceInfo);
    }
}

const InvoiceService = new _InvoiceService();
export default InvoiceService;