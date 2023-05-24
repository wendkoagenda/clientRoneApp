import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CustomBtn from '../../components/common/custom-button';
import CustomInput from '../../components/common/custom-input';
import { strings } from '../../constants';
import { Button, Form, notification, Popover, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { actions } from './user-profile-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { getErrorMessage } from '../../services/tracking.service';
import { IdentityService, TrackingService, ProfileService, SignatureService } from '../../services';
import { rules } from '../../helpers/validation-rules';
import UserSignature from '../user-management/user-signature.component';


const UserProfilePage = (props) => {
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [isProfileEditing, setProfileEditing] = useState(false);
    const [isPasswordEditing, setPasswordEditing] = useState(false);

    const updateUser = async () => {
        try {
            const profileInfo = await ProfileService.getUser();
            const signature = await SignatureService.getSignature(profileInfo?.data?.data?.id);

            const userData = {
                ...profileInfo?.data?.data,
                signatureImage: signature?.data?.data?.image
            }

            props.setUser(userData);
        }
        catch (error) {
            TrackingService.trackException(error);
        }
    }

    useEffect(() => {
        props.setPageInfo(strings.DRAWER_SECTIONS.MY_PROFILE);
        updateUser();
    }, []);

    const editUserData = () => {
        profileForm.setFieldsValue({
            userName: '',
            fullName: '',
            email: '',
            ...props.user
        });

        setProfileEditing(true);
    };

    const editPassword = () => {
        passwordForm.setFieldsValue({
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        });

        setPasswordEditing(true);
    };

    const saveNewPassword = async () => {
        const changePasswordModel = await passwordForm.validateFields();

        try {
            const newPasswordResponse = await IdentityService.changePassword(changePasswordModel);

            if (newPasswordResponse.status == 200) {
                notification['success']({
                    message: strings.COMMON.PASSWORD_CHANGE_SUCCESS
                })

                setPasswordEditing(false);
            }
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.PASSWORD_CHANGE_ERROR);

            notification['error']({
                message: errorMessage
            })
        }
    }

    const saveProfileChanges = async () => {
        const editProfileModel = await profileForm.validateFields();

        try {
            const editResponse = await ProfileService.updateUser(editProfileModel);

            if (editResponse.status == 200) {
                notification['success']({
                    message: strings.COMMON.PROFILE_CHANGE_SUCCESS
                })
            }

            updateUser();
            setProfileEditing(false);

        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.PROFILE_CHANGE_ERROR);
            TrackingService.trackException(error);

            notification['error']({
                message: errorMessage
            })
        }
    };

    const cancelEditing = () => {
        setProfileEditing(false);
        setPasswordEditing(false);
    }

    return (
        <>
            {!isPasswordEditing &&
                <div className="edit-btn">
                    <Popover placement="left" content={strings.COMMON.CHANGE_PROFILE_DETAILS}>
                        <Button icon={<EditOutlined />} onClick={editUserData}></Button>
                    </Popover>
                </div>
            }
            <div className="my-profile-layout" style={isPasswordEditing ? { marginTop: '74px' } : {}}>
                <h2>{strings.COMMON.PROFILE_DETAILS}</h2>
                <Form form={profileForm} component={false}>
                    <div className="user-data">
                        <div className="user-property">
                            {isProfileEditing
                                ? <CustomInput value={props.user.userName} rules={rules} name="userName" placeHolder={strings.USER_PROPERTIES.NAME} />
                                : <>
                                    <p className="property-label">{strings.USER_PROPERTIES.NAME}</p>
                                    {props.user.userName}
                                </>
                            }
                        </div>
                        <div className="user-property">
                            {isProfileEditing
                                ? <CustomInput value={props.user.fullName} rules={rules} name="fullName" placeHolder={strings.USER_PROPERTIES.FULL_NAME} />
                                : <>
                                    <p className="property-label">{strings.USER_PROPERTIES.FULL_NAME}</p>
                                    {props.user.fullName}
                                </>
                            }
                        </div>
                        <div className="user-property">
                            {isProfileEditing
                                ? <CustomInput value={props.user.email} rules={rules} name="email" placeHolder={strings.USER_PROPERTIES.MAIL} />
                                : <>
                                    <p className="property-label">{strings.USER_PROPERTIES.MAIL}</p>
                                    {props.user.email}
                                </>
                            }
                        </div>
                        <div className="user-property">
                            {
                                !isProfileEditing && (
                                    <Tooltip placement="top" title={strings.INPUT_RULES.SIGNATURE_IMAGE}>
                                        <div className="signature-label">
                                            <p className="property-label">{strings.USER_PROPERTIES.SIGNATURE}</p>
                                        </div>
                                        <div>
                                            <UserSignature image={props.user.signatureImage} userId={props.user.id} onUploadFinished={updateUser} />
                                        </div>
                                    </Tooltip>
                                )
                            }
                        </div>
                    </div>
                </Form>

                <div className="user-password">
                    <h2>{strings.COMMON.PASSWORD}</h2>
                    {isPasswordEditing
                        ? <div className="password-input">
                            <Form form={passwordForm}>
                                <CustomInput name="oldPassword" type="password" rules={rules} placeHolder={`Old ${strings.USER_PROPERTIES.PASSWORD}`} />
                                <CustomInput name="newPassword" type="password" rules={rules} placeHolder={`New ${strings.USER_PROPERTIES.PASSWORD}`} />
                                <CustomInput name="confirmNewPassword" type="password" rules={rules} placeHolder={`Confirm New ${strings.USER_PROPERTIES.PASSWORD}`} />
                            </Form>
                        </div>
                        : <div className="change-password-block">
                            <p className="property-label">{strings.USER_PROPERTIES.PASSWORD}</p>
                            {strings.COMMON.PASSWORD_LABEL}
                            {!isProfileEditing &&
                                <a onClick={editPassword}>Change Password</a>
                            }
                        </div>
                    }
                </div>

                {(isPasswordEditing || isProfileEditing) && (
                    <div className="edit-actions">
                        <CustomBtn type="default" name="Cancel" onClick={cancelEditing}></CustomBtn>
                        {isProfileEditing
                            ? <CustomBtn type="primary" name="Update Profile" onClick={saveProfileChanges}></CustomBtn>
                            : <CustomBtn type="primary" name="Change Password" onClick={saveNewPassword}></CustomBtn>
                        }
                    </div>
                )
                }
            </div>
        </>
    )
}


const mapState = ({ userProfile }) => {
    return {
        user: userProfile.userData
    };
}

const mapDispatch = (dispatch) => {
    return {
        setUser(value) {
            dispatch(actions.setUserProfile(value));
        },
        setPageInfo(pageName) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [] }));
        }
    }
}

export default connect(mapState, mapDispatch)(UserProfilePage);
