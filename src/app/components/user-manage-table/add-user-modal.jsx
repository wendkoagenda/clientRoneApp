import React from 'react';
import { Modal, Form, notification } from 'antd';
import CustomInput from '../../components/common/custom-input';
import CustomSelect from '../../components/common/custom-select';
import CustomBtn from '../../components/common/custom-button';
import { strings, roles } from '../../constants';
import { connect } from 'react-redux';
import { actions } from './user-management-reducer';
import { maskedPhoneNumberRule, rules } from '../../helpers/validation-rules';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import UserManagement from '../../services/user-management.service';
import { CustomMaskedInput, CustomSingleOptionSelect } from '../common';
import { getOnlyNumbers } from '../../helpers/text.helper';


const AddUserModal = (props) => {
    const [userForm] = Form.useForm();

    const handleSubmit = async () => {
        try {
            props.startLoading();
            const newUserModel = await userForm.validateFields();
            const parsedSites = newUserModel.sites.map((i) => Number(i));
            newUserModel.sites = parsedSites;
            newUserModel.phoneNumber = getOnlyNumbers(newUserModel.phoneNumber);

            const creteUserResponse = await UserManagement.createUser(newUserModel);

            if (creteUserResponse.status == 200) {
                notification['success']({
                    message: strings.COMMON.CREATE_SUCCESSFUL,
                });
            }

            userForm.resetFields();
            props.handleCancel();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.CREATE_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        props.endLoading();
        props.updateUsers();
    }

    const setFieldsValue = (value) => {
        userForm.setFields(value);
    }

    const rolesSelectOptions = Object.keys(roles).map(key => {
        return {
            key: roles[key],
            value: roles[key]
        }
    })

    return (
        <Form form={userForm}>
            <Modal title={strings.COMMON.ADD_USER}
                className="add-user-modal"
                visible={props.visible}
                onCancel={props.handleCancel}
                width='600px'
                footer={[
                    <CustomBtn name="Cancel" type="default" onClick={props.handleCancel} />,
                    <CustomBtn name="Submit" onClick={handleSubmit} type="primary" />
                ]}
            >
                <CustomInput name="userName" rules={rules} placeHolder={strings.USER_PROPERTIES.NAME} />
                <CustomInput name="fullName" rules={rules} placeHolder={strings.USER_PROPERTIES.FULL_NAME} />
                <CustomSingleOptionSelect
                    mode="multiple"
                    placeholder={strings.USERS.PLACEHOLDERS.ROLES}
                    name={strings.USERS.PROPS_NAME.ROLES}
                    options={rolesSelectOptions}
                    rules={rules}
                />
                <CustomSelect mode="multiple" name="sites" setFields={setFieldsValue} rules={rules} sites={props.sites} placeHolder={strings.USER_PROPERTIES.SITE} keys={true}>{props.sites}</CustomSelect>
                <CustomInput name="email" rules={rules} placeHolder={strings.USER_PROPERTIES.MAIL} />
                <CustomMaskedInput
                    inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                    name="phoneNumber"
                    rules={[{ validator: maskedPhoneNumberRule }]}
                    placeHolder={strings.USER_PROPERTIES.PHONE_NUMBER} />
            </Modal>
        </Form>
    );
};

const mapState = ({ userManagement }) => {
    return {
        users: userManagement.users,
        sites: userManagement.sites
    };
}

const mapDispatch = (dispatch) => {
    return {
        setUsers(value) {
            dispatch(actions.setUsers(value));
        },
        createNewUser(value) {
            dispatch(actions.createNewUser(value));
        },
        startLoading() {
            dispatch(actions.startLoading());
        },
        endLoading() {
            dispatch(actions.endLoading());
        }
    }
}

export default connect(mapState, mapDispatch)(AddUserModal);
