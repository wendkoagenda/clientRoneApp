import React from 'react';
import { connect } from 'react-redux';
import { Menu, Layout } from 'antd';
import history from '../../history';
import routes from '../../pages/routes';
import { pageNumbers, strings, roles } from '../../constants';
import {
    ArrowLeftOutlined,
    HomeOutlined,
    UserOutlined,
    FileOutlined,
    EnvironmentOutlined,
    BarcodeOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import _useLocalStorage from '../../helpers/local-storage-helper';

const { Sider } = Layout;

const dispatchStyleSider = {
    display: 'none'
}

const isCustomer = (userRoles) => {
    return(userRoles?.includes(roles.CUSTOMER) && userRoles.length==1)
}

const CustomSider = (props) => {
    const [isFullMap, setIsFullMap] = _useLocalStorage('isFullMap', false);

    return (
        <div className="custom-sider" style={(props.sidebarKey == '6' || (isFullMap && !props.name.length)) ? dispatchStyleSider : {}}>
            <Sider collapsedWidth="100px" defaultCollapsed="true" collapsible>
                <div className="logo" />
                {isCustomer(props.userRoles)
                    ? <Menu selectedKeys={props.sidebarKey} mode="inline">
                        <Menu.Item className="action-menu-item" key="5" icon={<ArrowLeftOutlined />} onClick={() => history.goBack()}>{strings.COMMON.GO_BACK}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.HOME} size="4x" icon={<HomeOutlined />} onClick={() => history.push(routes.HOME)}>{strings.PAGES.HOME}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.PROJECTS} icon={<FileOutlined />} onClick={() => history.push(routes.PROJECTS_BY_CUSTOMER)}>{strings.PAGES.PROJECTS}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.REPORT_LIST} icon={<FilePdfOutlined />} onClick={() => history.push(routes.REPORT_LIST_BY_CUSTOMER)}>{strings.DRAWER_SECTIONS.REPORT_LIST}</Menu.Item>
                    </Menu>
                    : <Menu selectedKeys={props.sidebarKey} mode="inline">
                        <Menu.Item className="action-menu-item" key="5" icon={<ArrowLeftOutlined />} onClick={() => history.goBack()}>{strings.COMMON.GO_BACK}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.HOME} size="4x" icon={<HomeOutlined />} onClick={() => history.push(routes.HOME)}>{strings.PAGES.HOME}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.CLIENT} icon={<UserOutlined />} onClick={() => history.push(routes.MANAGE_CLIENTS)}>{strings.PAGES.CLIENTS}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.PROJECTS} icon={<FileOutlined />} onClick={() => history.push(routes.PROJECTS)}>{strings.PAGES.PROJECTS}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.DISPATCH_PROCESS} icon={<EnvironmentOutlined />} onClick={() => history.push(routes.DISPATCH_PROCESS)}>{strings.PAGES.DISPATCH}</Menu.Item>
                        <Menu.Item className="default-menu-item" key={pageNumbers.BREAK_LIST} icon={<BarcodeOutlined />} onClick={() => history.push(routes.BREAK_LIST)}>{strings.PAGES.BREAK_LIST}</Menu.Item>
                    </Menu>
                }
            </Sider>
        </div>
    )
}

const mapState = ({ authorizedLayout }) => {
    return {
        sidebarKey: authorizedLayout.page.sidebarKey,
        name: authorizedLayout.page.name,
        userRoles: authorizedLayout.user.roles,
    };
}

export default connect(mapState, null)(CustomSider);