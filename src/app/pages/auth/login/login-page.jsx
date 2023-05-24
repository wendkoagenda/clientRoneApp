import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, notification } from 'antd';
import { StatusCodes } from 'http-status-codes';
import { NotAuthorizedLayout } from '../../../components/layouts';
import { CustomBtn, CustomInput } from '../../../components/common';
import routes from '../../routes';
import history from '../../../history';
import { IdentityService, ProfileService, GlobalService } from '../../../services';
import { authResponseStatuses } from '../../../constants';
import logo from '../../../../assets/images/rone-logo-default.png';
import { strings } from '../../../constants';
import { actions as globalActions } from '../../../store/reducers/authorized-layout.reducer';
import { getErrorMessage } from '../../../services/tracking.service';


const ResetPasswordForm = ({ onSubmit, isLoading, onBackToLogin }) => {
    return (
        <Form
            name="reset"
            onFinish={onSubmit}
        >
            <Form.Item
                rules={[{ required: true, message: strings.INPUT_RULES.LOGIN.EMAIL_REQUIRED }]}
            >
                <CustomInput placeHolder="Email" name="email" />
            </Form.Item>

            <Link to='#' onClick={onBackToLogin} className="forgot-password">{strings.COMMON.BACK_TO_LOGIN}</Link>

            <Form.Item>
                <CustomBtn isLoading={isLoading} name="RESET" htmlType="submit" type="primary" style={{ width: '100%' }} >
                    Reset
                </CustomBtn>
            </Form.Item>
        </Form>
    );
};

const LoginForm = ({ onSubmit, isLoading, onPasswordReset }) => {
    return (
        <Form
            name="login"
            onFinish={onSubmit}
        >
            <Form.Item
                rules={[{ required: true, message: strings.INPUT_RULES.LOGIN.USERNAME_REQUIRED }]}
            >
                <CustomInput placeHolder="Username" name="userName" />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: strings.INPUT_RULES.LOGIN.PASSWORD_REQUIRED }]}
            >
                <CustomInput type="password" name="password" placeHolder="Password" />
            </Form.Item>

            <Link to='#' onClick={onPasswordReset} className="forgot-password">{strings.COMMON.FORGOT_PASSWORD}</Link>

            <Form.Item>
                <CustomBtn isLoading={isLoading} name="LOGIN" htmlType="submit" type="primary" style={{ width: '100%' }} >
                    Login
                </CustomBtn>
            </Form.Item>
        </Form>
    );
};

const LoginPage = (props) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loginState, setLoginState] = useState({
        error: null,
        message: null,
        email: null,
        isLoading: false
    });

    const onEmailChange = (e) => {
        setLoginState(prev => {
            return {
                ...prev,
                email: e.target.value
            };
        });
    };

    const refreshUserInfo = async () => {
        const profileInfo = await ProfileService.getUser();
        const allSites = await GlobalService.getAllSites();

        props.setValue('user', profileInfo.data.data);
        props.setValue('allSites', allSites.data.data);
    };

    const login = async (loginModel) => {
        setLoginState(prev => {
            return {
                ...prev,
                error: null,
                message: null,
                isLoading: true
            }
        });

        const model = { ...loginModel, email: loginModel.userName };

        try {
            const resp = await IdentityService.login(model);

            IdentityService.setIdentity(resp.data.data);
            await refreshUserInfo();

            setLoginState(prev => {
                return {
                    ...prev,
                    isLoading: false
                }
            });

            history.push(routes.HOME);
        } catch (error) {
            let errorMessage = null;

            if (error.response.status == StatusCodes.BAD_REQUEST) {
                if (error.response.data.message == authResponseStatuses.INVALID_USERNAME_OR_PASSWORD) {
                    errorMessage = strings.ERRORS_MESSAGE.LOGIN.INVALID_DATA;
                } else if (error.response.data.message == authResponseStatuses.ACCOUNT_IS_DISABLED) {
                    errorMessage = strings.ERRORS_MESSAGE.LOGIN.USER_IS_DISABLED;
                } else {
                    errorMessage = strings.ERRORS_MESSAGE.LOGIN.BAD_REQUEST;
                }
            } else {
                errorMessage = strings.ERRORS_MESSAGE.LOGIN.UNKNOWN_ERROR;
            }

            setLoginState(prev => {
                return {
                    ...prev,
                    error: errorMessage,
                    isLoading: false
                }
            });
        }
    };

    const resetPassword = async (resetPasswordModel) => {
        setLoginState(prev => {
            return {
                ...prev,
                error: null,
                message: null,
                isLoading: true
            }
        });

        try {
            await IdentityService.forgotPassword(resetPasswordModel);

            setLoginState(prev => {
                return {
                    ...prev,
                    isLoading: false
                }
            });

            openSuccessNotification("The email with new password was send to you.");

            history.push(routes.LOGIN);
        } catch (error) {
            const errorMessage = getErrorMessage(error);

            openErrorNotification(errorMessage);

            setLoginState(prev => {
                return {
                    ...prev,
                    isLoading: false
                }
            });
        }
    };

    const openSuccessNotification = (info) => {
        notification.success({
            message: info,
            placement: 'bottomRight'
        });
    }

    const openErrorNotification = (info) => {
        notification.error({
            message: info,
            placement: 'bottomRight'
        });
    }

    useEffect(() => {
        props.setPageInfo(strings.PAGES.LOGIN);
    }, []);

    return (
        <NotAuthorizedLayout>
            <div className="login-layout">

                <div className="login-photo">
                </div>

                <div className="login-form">
                    <img src={logo} style={{ width: '140px' }} />

                    <h1 className="login-label">{strings.COMMON.WELCOME} {strings.COMPANY_NAME}</h1>

                    {
                        isLoginMode ? (
                            <>
                                <LoginForm
                                    onSubmit={login}
                                    onEmailChange={onEmailChange}
                                    isLoading={loginState.isLoading}
                                    onPasswordReset={() => setIsLoginMode(false)} />
                                {
                                    !!loginState.error && openErrorNotification(loginState.error)
                                }
                                {
                                    !!loginState.message && openSuccessNotification(loginState.message)
                                }
                            </>
                        ) : (
                            <ResetPasswordForm
                                onSubmit={resetPassword}
                                onEmailChange={onEmailChange}
                                isLoading={loginState.isLoading}
                                onBackToLogin={() => setIsLoginMode(true)} />
                        )
                    }
                </div>
            </div>
        </NotAuthorizedLayout>
    );
};

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [] }));
        },
        setValue(name, value) {
            dispatch(globalActions.setValue(name, value));
        }
    }
}

export default connect(null, mapDispatch)(LoginPage);