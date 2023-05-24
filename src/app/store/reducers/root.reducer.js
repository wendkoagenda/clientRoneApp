import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import authorizedLayoutReducer from "./authorized-layout.reducer";
import userProfileReducer from "../../pages/user-profile/user-profile-reducer";
import userManagementReducer from '../../components/user-manage-table/user-management-reducer';
import clientManagementReducer from '../../pages/client-management/client-reducer';
import projectsReducer from '../../pages/projects/projects-reducer';
import journalReducer from '../../pages/journal/journal-reducer';
import dispatchReducer from '../../pages/dispatch-management/dispatch-reducer';
import dispatchProcessReducer from '../../pages/dispatch-process-page/dispatch-process-reducer';
import reportsReducer from '../../pages/reports/reports-reducer';
import workOrderReducer from '../../pages/dispatch-management/work-orders-reducer';
import sitesManagementReducer from '../../pages/sites-management/sites-management-reducer';
import breakListReducer from '../../pages/break-list/break-list.reducer';
import workOrdersManagementReducer from '../../pages/work-orders-management/work-orders-management-reducer';
import budgetReducer from "../../pages/projects/budget-constructor/budget-reducer";
import budgetSheetReducer from "../../pages/budget-sheet-admin/budget-sheet.reducer";
import invoiceReducer from "../../pages/invoice/invoice.reducer";
import invoicesJournalReducer from "../../pages/invoice-journal/invoice-journal.reducer";
import budgetComparisonReducer from "../../pages/projects/budget-comparison/budget-comparison.reducer";
import reportListReducer from "../../pages/report-list/report-list.reducer";
import customerPortalReducer from "../../pages/customer-portal/customer-portal-reducer";

const createRootReducer = (history) => combineReducers({
    router: connectRouter(history),
    authorizedLayout: authorizedLayoutReducer,
    userProfile: userProfileReducer,
    userManagement: userManagementReducer,
    clientManagement: clientManagementReducer,
    projects: projectsReducer,
    journal: journalReducer,
    dispatch: dispatchReducer,
    dispatchProcess: dispatchProcessReducer,
    workOrders: workOrderReducer,
    sitesManagement: sitesManagementReducer,
    reports: reportsReducer,
    breakList: breakListReducer,
    workOrdersManagement: workOrdersManagementReducer,
    budget: budgetReducer,
    budgetSheet: budgetSheetReducer,
    invoice: invoiceReducer,
    invoiceJournal: invoicesJournalReducer,
    budgetComparison: budgetComparisonReducer,
    reportList: reportListReducer,
    customer: customerPortalReducer
});

export default createRootReducer;