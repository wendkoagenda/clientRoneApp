import React, { useState, useEffect } from 'react';
import { Button, Drawer, Layout, Spin, Tooltip } from 'antd';
import { connect } from 'react-redux';
import routes from '../../pages/routes';
import { actions as dispatchActions } from '../../pages/dispatch-management/dispatch-reducer';
import { actions } from '../../store/reducers/authorized-layout.reducer';
import { actions as breakListActions } from '../../pages/break-list/break-list.reducer';
import CommonLayout from './common-layout';
import { IdentityService } from '../../services';
import history from '../../history';
import { CustomSider, CustomSingleOptionSelect } from '../common';
import roneLogo from '../../../assets/images/rone-logos.png';
import jrbLogo from '../../../assets/images/jrb-logo.png';
import { strings, roles, pageNumbers } from '../../constants';
import {
    MenuOutlined,
    CloseOutlined,
    LogoutOutlined,
    ReconciliationOutlined,
    SmileOutlined,
    SolutionOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UnorderedListOutlined,
    LoadingOutlined,
    TagsOutlined,
    DollarCircleOutlined,
    ContainerOutlined,
    FileSyncOutlined,
    FilePdfOutlined,
    TeamOutlined 
} from '@ant-design/icons';
import useLocalStorage from 'react-use-localstorage';
import { breakListReportTypesIds, reportTypes } from '../../constants/report-types';

const { Header, Content } = Layout;

const reportTypesSelectOptions = reportTypes.filter(item => breakListReportTypesIds.includes(item.reportTypeId)).map(item => {
    return {
        key: item.reportTypeId,
        value: item.reportTypeId,
        displayValue: item.reportName
    }
})

const AuthorizedLayoutComponent = (props) => {
    const [visible, setVisible] = useState(false);
    const [isFullSizeMode, setFullSizeMode] = useState(isFullMap);
    const loadingIcon = <LoadingOutlined style={{ fontSize: 60, color: '#fff' }} spin />;

    const [isFullMap, setIsFullMap] = useLocalStorage('isFullMap');

    useEffect(() => {
        setFullSizeMode(isFullMap)
    }, [isFullMap])

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const logout = () => {
        IdentityService.logout();
        history.push(routes.LOGIN);
    }

    const onSidebarItemClicked = (pageName) => {
        setVisible(false);

        history.push(pageName)
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {props.isGlobalSpinActive && (
                <div className="global-spin" style={{ height: `${document.getElementById('root').clientHeight}px`, width: `${document.getElementById('root').clientWidth}px` }}>
                    <Spin indicator={loadingIcon} />
                </div>
            )
            }
            <CustomSider />
            <Layout className="site-layout" style={{ paddingBottom: (props.sidebarKey != pageNumbers.DISPATCH_PROCESS && !(isFullMap && !props.name.length)) && '2vh' }}>
                <Header
                    className="site-layout-background"
                    style={{
                        display: (isFullMap && !props.name.length) && 'none',
                        padding: 0,
                        textAlign: "right",
                        paddingRight: "15px",
                    }}
                >
                    {visible ? (
                        <Button
                            className="header-btn left"
                            onClick={onClose}
                            icon={<CloseOutlined />}
                        />
                    ) : (
                        <Button
                            className="header-btn left"
                            onClick={showDrawer}
                            icon={<MenuOutlined />}
                        />
                    )}
                    {props.isRoneLogo ? (
                        <img
                            src={roneLogo}
                            style={
                                props.sidebarKey == pageNumbers.DISPATCH_PROCESS
                                    ? { marginLeft: "170px" }
                                    : {}
                            }
                            className="company-logo"
                        />
                    ) : (
                        <img
                            src={jrbLogo}
                            style={{ width: "140px" }}
                            className="company-logo"
                        />
                    )}

                    <div className="page-name" style={{ marginLeft: props.sidebarKey == pageNumbers.BREAK_LIST && '10vw' }}>
                        <h1>{props.pageName}</h1>
                    </div>
                    <div className="additional-header-props">
                        {props.sidebarKey == pageNumbers.DISPATCH_PROCESS && (
                            <>
                                <Tooltip title={strings.PAGES.WORK_ORDERS_LIST}>
                                    <Button
                                        className="header-btn"
                                        style={{ marginRight: "3vw" }}
                                        onClick={() => history.push(routes.WORK_ORDERS)}
                                        icon={<UnorderedListOutlined />}
                                    />
                                </Tooltip>
                                <Tooltip title={strings.PAGES.DISPATCH_MANAGEMENT.ADD}>
                                    <Button
                                        className="header-btn"
                                        style={{ marginRight: "3vw" }}
                                        onClick={() => {
                                            props.clearEditingDispatch();
                                            history.push(routes.DISPATCH_MANAGEMENT)
                                        }
                                        }
                                        icon={<EnvironmentOutlined />}
                                    />
                                </Tooltip>
                                <Tooltip title={strings.PAGES.HOME}>
                                    <Button
                                        className="header-btn"
                                        style={{ marginRight: "3vw" }}
                                        onClick={() => history.push(routes.HOME)}
                                        icon={<HomeOutlined />}
                                    />
                                </Tooltip>
                            </>
                        )}
                        {
                            props.sidebarKey == pageNumbers.BREAK_LIST && (
                                <CustomSingleOptionSelect
                                    placeholder={strings.COMMON.SELECT_REPORT_TYPE}
                                    handleChange={props.setReportTypeId}
                                    options={reportTypesSelectOptions}
                                    value={props.reportType}
                                    style={{ width: '300px' }}
                                    dropdownClassName="report-type-dropdown"
                                />
                            )
                        }
                        <Tooltip title={strings.COMMON.LOG_OUT}>
                            <Button
                                className="header-btn"
                                onClick={logout}
                                icon={<LogoutOutlined />}
                            />
                        </Tooltip>
                    </div>
                    <Drawer
                        className="custom-drawer"
                        style={{ marginTop: "9vh" }}
                        width="320"
                        placement="left"
                        closable={false}
                        visible={visible}
                    >
                        <Button
                            className="drawer-section"
                            onClick={() => onSidebarItemClicked(routes.MANAGE_PROFILE)}
                        >
                            <div className="drawer-btn">
                                <SmileOutlined />
                                <p>{strings.DRAWER_SECTIONS.MY_PROFILE}</p>
                            </div>
                        </Button>
                        {props.userRoles?.includes(roles.ADMIN) && (
                            <>
                                <Button
                                    className="drawer-section drawer-btn"
                                    onClick={() => onSidebarItemClicked(routes.MANAGE_USERS)}
                                >
                                    <div className="drawer-btn">
                                        <ReconciliationOutlined />
                                        <p>{strings.DRAWER_SECTIONS.USERS}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.JOURNAL)}
                                >
                                    <div className="drawer-btn">
                                        <SolutionOutlined />
                                        <p>{strings.DRAWER_SECTIONS.JOURNAL}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.SITES_MANAGEMENT)}
                                >
                                    <div className="drawer-btn">
                                        <EnvironmentOutlined />
                                        <p>{strings.DRAWER_SECTIONS.SITE_MANAGEMENT}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.WORK_ORDERS_MANAGEMENT)}
                                >
                                    <div className="drawer-btn">
                                        <TagsOutlined />
                                        <p>{strings.DRAWER_SECTIONS.WORK_ORDERS_MANAGEMENT}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.BUDGET_SHEET_LIST)}
                                >
                                    <div className="drawer-btn">
                                        <DollarCircleOutlined />
                                        <p>{strings.DRAWER_SECTIONS.BUDGET_SHEET}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.INVOICE_PAGE)}
                                >
                                    <div className="drawer-btn">
                                        <ContainerOutlined />
                                        <p>{strings.DRAWER_SECTIONS.INVOICE}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.INVOICE_JOURNAL)}
                                >
                                    <div className="drawer-btn">
                                        <FileSyncOutlined />
                                        <p>{strings.DRAWER_SECTIONS.INVOICE_JOURNAL}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.CUSTOMER_PORTAL)}
                                >
                                    <div className="drawer-btn">
                                        <TeamOutlined />
                                        <p>{strings.DRAWER_SECTIONS.CUSTOMER_PORTAL}</p>
                                    </div>
                                </Button>
                                <Button
                                    className="drawer-section"
                                    onClick={() => onSidebarItemClicked(routes.REPORT_LIST)}
                                >
                                    <div className="drawer-btn">
                                        <FilePdfOutlined />
                                        <p>{strings.DRAWER_SECTIONS.REPORT_LIST}</p>
                                    </div>
                                </Button>
                            </>
                        )}
                    </Drawer>
                </Header>
                <Content style={{ margin: "0 16px" }}>{props.children}</Content>
            </Layout>
        </Layout>
    );
}

const mapState = ({ authorizedLayout, breakList }) => {
    return {
        collapsed: authorizedLayout.collapsed,
        userRoles: authorizedLayout.user.roles,
        isRoneLogo: authorizedLayout.isRoneLogo,
        sidebarKey: authorizedLayout.page.sidebarKey,
        name: authorizedLayout.page.name,
        isGlobalSpinActive: authorizedLayout.isGlobalSpinActive,
        reportType: breakList.reportTypeId
    };
}

const mapDispatch = (dispatch) => {
    return {
        setValue(name, value) {
            dispatch(actions.setValue(name, value));
        },
        clearEditingDispatch() {
            dispatch(dispatchActions.clearEditingDispatch());
        },
        setReportTypeId(id) {
            dispatch(breakListActions.setReportTypeId(id));
        }
    }
}

const AuthorizedLayout = CommonLayout(connect(mapState, mapDispatch)(AuthorizedLayoutComponent));
export default AuthorizedLayout;