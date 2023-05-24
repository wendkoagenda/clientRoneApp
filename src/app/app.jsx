import * as React from "react";
import { connect, Provider } from 'react-redux';
import { Route, Switch } from "react-router";
import { ConnectedRouter } from "connected-react-router";
import history from "./history";
import routes from "./pages/routes";
import { roles } from "./constants";
import { AuthenticatedRoute, UnauthenticatedRoute } from "./components/auth-middleware";
import { AuthorizedLayout } from "./components/layouts";
import { ProfileService, GlobalService } from "./services";
import { actions as globalActions } from "./store/reducers/authorized-layout.reducer";

import HomePage from "./pages/home";
import LoginPage from "./pages/auth/login";
import NotFoundPage from "./pages/not-found";
import ManageProfilePage from "./pages/profile/manage";
import UserProfilePage from "./pages/user-profile/user-profile";
import ErrorBoundary from './pages/error-page/errorBoundary';
import UserManagementPage from './pages/user-management/user-management';
import ClientListPage from './pages/client-management/client-list';
import CreateAndEditClientPage from './pages/client-management/client-creating-editing';
import ProjectsListPage from './pages/projects/projects-list';
import ProjectManagementPage from './pages/projects/project-management';
import JournalTable from './pages/journal/journal-table';
import DispatchManagementPage from './pages/dispatch-management/dispatch-management';
import DispatchesListPage from './pages/dispatch-management/dispatch-list';
import WorkOrdersListPage from './pages/dispatch-management/work-orders-list';
import DispatchProcess from './pages/dispatch-process-page/dispatch-process';
import TechLocationMap from "./pages/dispatch-process-page/tech-location-map";
import SitesList from './pages/sites-management/sites-list';
import ReportViewer from './pages/reports/report-viewer';
import ReportsTable from './pages/reports/reports-table';
import BreakListPage from './pages/break-list/break-list';
import WorkOrdersList from "./pages/work-orders-management/work-orders-list";
import ConcreteCylindersEditLayout from "./pages/reports/concrete-cylinders-edit-layout";
import BudgetSheetTable from './pages/budget-sheet-admin/budget-sheet.table';
import InvoicePage from './pages/invoice/invoice-page';
import InvoiceJournalPage from './pages/invoice-journal/invoice-journal';
import BudgetComparisonTable from './pages/projects/budget-comparison/budget-comparison.table';
import ReportList from "./pages/report-list/report-list";
import ReportItemLayout from './pages/report-list/report-item.layout';
import soilMoistureDensityRelationshipEditLayout from "./pages/reports/soil-moisture-density-relationship-edit-layout";
import soilMoistureDensityRelationshipMethodBEditLayout from "./pages/reports/soil-moisture-density-relationship-method-b-edit-layout";
import CustomersListPage from "./pages/customer-portal";
import ManageUserProjects from "./pages/customer-portal/assign-projects"
import AssignedProjects from './pages/assigned-projects/assigned-projects'
import ProjectViewPage from './pages/assigned-projects/project-view'
import CustomerReportList from './pages/customer-report-list'
import soilInPlaceDensityTestingEditLayout from "./pages/reports/soil-in-place-density-testing-edit-layout";
import CustomerReportItemLayout from "./pages/customer-report-list/report-item"


const App = (props) => {
    const updateUserIdentity = async () => {
        if (!props.user || !props.user.sites) {
            const profileInfo = await ProfileService.getUser();
            const allSites = await GlobalService.getAllSites();

            props.setValue('user', profileInfo.data.data);
            props.setValue('allSites', allSites.data.data);
        }
    };

    return (
        <Provider store={props.store}>
            <ConnectedRouter history={history}>
                <ErrorBoundary>
                    <Switch>
                        <UnauthenticatedRoute exact path={routes.LOGIN} component={LoginPage} />
                        <Route>
                            <AuthorizedLayout pageName={props.pageName}>
                                <Switch>
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={"/"} component={HomePage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.HOME} component={HomePage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.MANAGE_PROFILE} component={UserProfilePage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.MANAGE_PROFILE} component={ManageProfilePage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.MANAGE_USERS} component={UserManagementPage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.CREATE_EDIT_CLIENT} component={CreateAndEditClientPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.JOURNAL} component={JournalTable} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.MANAGE_CLIENTS} component={ClientListPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.PROJECTS} component={ProjectsListPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.PROJECT_MANAGEMENT} component={ProjectManagementPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.DISPATCH_MANAGEMENT} component={DispatchManagementPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.DISPATCHES} component={DispatchesListPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.WORK_ORDERS} component={WorkOrdersListPage} roles={[roles.ADMIN, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.DISPATCH_PROCESS} component={DispatchProcess} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.FULL_SCREEN_MAP} component={TechLocationMap} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.SITES_MANAGEMENT} component={SitesList} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_FORM} component={ReportViewer} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORTS_TABLE} component={ReportsTable} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.BREAK_LIST} component={BreakListPage} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.WORK_ORDERS_MANAGEMENT} component={WorkOrdersList} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.CYLINDERS_REPORT_FORM} component={ConcreteCylindersEditLayout} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.BUDGET_SHEET_LIST} component={BudgetSheetTable} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.INVOICE_PAGE} component={InvoicePage} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.INVOICE_JOURNAL} component={InvoiceJournalPage} roles={[roles.ADMIN, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.BUDGET_COMPARISON_ROUTE} component={BudgetComparisonTable} roles={[roles.ADMIN, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_LIST} component={ReportList} roles={[roles.ADMIN, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_ITEM} component={ReportItemLayout} roles={[roles.ADMIN, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_ITEM_BY_CUSTOMER} component={CustomerReportItemLayout} roles={[roles.ADMIN, roles.CUSTOMER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.SOIL_REPORT_FORM} component={soilMoistureDensityRelationshipEditLayout} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.SOIL_REPORT_FORM_METHOD_B} component={soilMoistureDensityRelationshipMethodBEditLayout} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.CUSTOMER_PORTAL} component={CustomersListPage} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.USER_MANAGE_PROJECTS} component={ManageUserProjects} roles={[roles.ADMIN]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.PROJECTS_BY_CUSTOMER} component={AssignedProjects} roles={[roles.ADMIN, roles.CUSTOMER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.PROJECT_VIEW_PAGE} component={ProjectViewPage} roles={[roles.ADMIN, roles.CUSTOMER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_LIST_BY_CUSTOMER} component={CustomerReportList} roles={[roles.ADMIN, roles.CUSTOMER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.SOIL_REPORT_FORM_METHOD_B} component={soilInPlaceDensityTestingEditLayout} roles={[roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]} />
                                    <AuthenticatedRoute exact refreshIdentity={updateUserIdentity} path={routes.REPORT_LIST_BY_CUSTOMER_BY_PROJECT} component={CustomerReportList} roles={[roles.CUSTOMER]} />
                                    <Route component={NotFoundPage} />
                                </Switch>
                            </AuthorizedLayout>
                        </Route>
                    </Switch>
                </ErrorBoundary>
            </ConnectedRouter>
        </Provider>
    )
};

const mapState = ({ authorizedLayout }) => {
    return {
        pageName: authorizedLayout.page.name,
        user: authorizedLayout.user
    };
};

const mapDispatch = (dispatch) => {
    return {
        setValue(name, value) {
            dispatch(globalActions.setValue(name, value));
        },
    }
}

export default connect(mapState, mapDispatch)(App);