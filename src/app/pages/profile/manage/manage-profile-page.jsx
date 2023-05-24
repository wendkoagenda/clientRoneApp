import { Form, Input, Button, Alert } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { actions as globalActions } from '../../../store/reducers/authorized-layout.reducer';
import IdentityService from '../../../services/identity.service';
import ProfileService from '../../../services/profile.service';

const ChangePasswordForm = ({ onSubmit }) => {
    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            name="reset-password"
            onFinish={onSubmit}
        >
            <Form.Item
                name="oldPassword"
                label="Old password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your old password!'
                    },
                ]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="newPassword"
                label="New password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your new password!'
                    },
                ]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="confirmNewPassword"
                label="Confirm new password"
                dependencies={['newPassword']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your new password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Change
                </Button>
            </Form.Item>
        </Form>
    );
};

const EditProfileForm = ({ onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            name="change-password"
            initialValues={initialValues}
            onFinish={onSubmit}
        >
            <Form.Item
                name="fullName"
                label="Full name"
                rules={[
                    {
                        required: true,
                        message: 'Please input your full name!'
                    },
                ]}
                hasFeedback
            >
                <Input />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
};

class ManageProfilePage extends React.Component {
    state = {
        error: null,
        message: null,
        user: null
    };

    componentDidMount() {
        this.props.setPageInfo();
        ProfileService.getUser()
            .then(resp => {
                this.setState({
                    user: resp.data
                });
            })
    }

    componentDidUpdate() {
        this.props.setPageInfo();
    }

    editProfile = (model) => {
        ProfileService.updateUser(model)
            .then(resp => {
                this.setState({
                    message: 'Profile was successfully updated!'
                });

                var currentIdentity = IdentityService.getIdentity();
                var updatedIdentity = {
                    ...currentIdentity,
                    user: {
                        ...currentIdentity.user,
                        name: model.fullName
                    }
                };
                IdentityService.setIdentity(updatedIdentity);
            })
            .catch(resp => {
                this.setState({
                    error: 'Unknown error. Please, try again.'
                })
            })
    }

    changePassword = (model) => {
        IdentityService.changePassword(model)
            .then(resp => {
                this.setState({
                    message: 'Your password was successfully changed!'
                });
            })
            .catch(error => {
                this.setState({
                    error: 'Unknown error. Please, try again.'
                });
            });
    }

    render() {
        return (
            <>
                <h1>Manage profile</h1>

                {
                    !!this.state.error &&
                    <Alert message={this.state.error} type="error" showIcon />
                }
                {
                    !!this.state.message &&
                    <Alert message={this.state.message} type="success" showIcon />
                }

                {
                    !!this.state.user &&
                    <React.Fragment>
                        <h2>Edit profile</h2>
                        <EditProfileForm onSubmit={this.editProfile} initialValues={{ fullName: this.state.user.fullName }} />
                    </React.Fragment>
                }

                <h2>Change password</h2>
                <ChangePasswordForm onSubmit={this.changePassword} />
            </>
        );
    }
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo() {
            dispatch(globalActions.setPageInfo({ name: null, sidebarKey: [] }));
        }
    }
}

export default connect(null, mapDispatch)(ManageProfilePage);