import { Button, notification } from 'antd';
import history from '../../history';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
    TrackingService,
    IdentityService,
    ProfileService
} from "../../services";
import {
    UserOutlined,
    FileOutlined,
    EnvironmentOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import { pageNumbers, roles, strings } from '../../constants';
import routes from '../routes';
import { getErrorMessage } from '../../services/tracking.service';


const HomePage = (props) => {
    const getUserRelatedNotifications = async () => {
        const isInAllowedRoles = IdentityService.isInRoles([roles.ADMIN, roles.PROJECT_MANAGER, roles.DISPATCHER]);
        if (isInAllowedRoles) {
            try {
                const notificationsResponse = await ProfileService.getWorkOrderNotifications();

                const breakWorkOrdersCount = notificationsResponse.data.data.breakWorkOrdersCount;
                const earlyBreakWorkOrdersCount = notificationsResponse.data.data.earlyBreakWorkOrdersCount;

                if (breakWorkOrdersCount !== 0) {
                    notification['success']({
                        message: `Today is BreakDate for ${breakWorkOrdersCount} work order(s)`
                    });
                }

                if (earlyBreakWorkOrdersCount !== 0) {
                    notification['success']({
                        message: `Today is early BreakDate for ${earlyBreakWorkOrdersCount} work order(s)`
                    });
                }
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_FETCH_NOTIFICATIONS);
                notification['error']({
                    message: errorMessage
                });

                TrackingService.trackException(error);
            }
        }
    };

    useEffect(() => {
        props.setPageInfo(strings.PAGES.HOME, pageNumbers.HOME);

        getUserRelatedNotifications();
    }, [])

    return (
        <div className="home-layout">
            <div className="home-welcome">
                <h1>{strings.COMMON.WELCOME}</h1>
                <h2>{strings.COMPANY_NAME}</h2>
            </div>
            {IdentityService.isInRoles([roles.CUSTOMER])
                ? <div className="home-block-content">
                    <Button onClick={() => history.push(routes.PROJECTS_BY_CUSTOMER)} className="home-page-btn">
                        <div className="icon-background">
                            <FileOutlined />
                        </div>
                        <p className="btn-label">{strings.PAGES.PROJECTS}</p>
                    </Button>
                    <Button onClick={() => history.push(routes.REPORT_LIST_BY_CUSTOMER)} className="home-page-btn">
                        <div className="icon-background">
                            <FilePdfOutlined />
                        </div>
                        <p className="btn-label">{strings.PAGES.REPORT_LIST}</p>
                    </Button>
                </div>
                : <div className="home-block-content">
                    <Button className="home-page-btn" onClick={() => history.push(routes.MANAGE_CLIENTS)}>
                        <div className="icon-background">
                            <UserOutlined />
                        </div>
                        <p className="btn-label">{strings.PAGES.CLIENTS}</p>
                    </Button>

                    <Button onClick={() => history.push(routes.PROJECTS)} className="home-page-btn">
                        <div className="icon-background">
                            <FileOutlined />
                        </div>
                        <p className="btn-label">{strings.PAGES.PROJECTS}</p>
                    </Button>

                    <Button onClick={() => history.push(routes.DISPATCH_PROCESS)} className="home-page-btn">
                        <div className="icon-background">
                            <EnvironmentOutlined />
                        </div>
                        <p className="btn-label">{strings.PAGES.DISPATCH}</p>
                    </Button>
                </div>
                }
        </div>
    );
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        }
    }
}

export default connect(null, mapDispatch)(HomePage);