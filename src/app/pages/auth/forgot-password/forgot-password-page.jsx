import { Alert, Input, Form, Button } from 'antd';
import React from 'react';
import { NotAuthorizedLayout } from '../../../components/layouts';
import IdentityService from '../../../services/identity.service';

const ForgotPasswordForm = ({ onSubmit, prepopulatedEmail }) => {
    return (
        <Form
            name="forgot-password"
            initialValues={{
                email: prepopulatedEmail
            }}
            onFinish={onSubmit}
        >
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid email!',
                    },
                    {
                        required: true, message: 'Please input your email!'
                    }]}
            >
                <Input />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

class ForgotPasswordPage extends React.Component {
    state = {
        error: null,
        message: null,
        prepopulatedEmail: this.props.location.state.email || ""
    };

    requestForgotPassword = (model) => {
        IdentityService.forgotPassword(model)
            .then(resp => {
                this.setState({
                    message: `Forgot password process was successfully initiated!. Please, check your ${model.email} mailbox for further instructions.`
                });
            })
            .catch(error => {
                switch (error.response.status) {
                    default:
                        this.setState({
                            error: "Unknown error on forgot password request. Please, try again."
                        });
                        break;
                }
            });
    }

    render() {
        return (
            <NotAuthorizedLayout>
                <h1>Forgot password</h1>
                <ForgotPasswordForm onSubmit={this.requestForgotPassword} prepopulatedEmail={this.state.prepopulatedEmail} />
                {
                    !!this.state.error &&
                    <Alert message={this.state.error} type="error" showIcon />
                }
                {
                    !!this.state.message &&
                    <React.Fragment>
                        <Alert message={this.state.message} type="success" showIcon />
                    </React.Fragment>
                }
            </NotAuthorizedLayout>
        );
    }
}

export default ForgotPasswordPage;