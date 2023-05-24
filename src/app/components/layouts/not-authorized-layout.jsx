import React from 'react';
import { Layout } from 'antd';
import CommonLayout from './common-layout';

const { Content } = Layout;

class NotAuthorizedLayoutComponent extends React.Component {
    render() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Layout className="site-layout">
                    <Content style={{ display: 'flex'}}>
                        {this.props.children}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

const NotAuthorizedLayout = CommonLayout(NotAuthorizedLayoutComponent);
export default NotAuthorizedLayout;