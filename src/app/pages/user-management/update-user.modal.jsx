import { Col, Modal, Row, Form, Button, notification, Switch } from 'antd';
import React, { useEffect } from 'react';
import { CustomInput, CustomMaskedInput, CustomSingleOptionSelect } from '../../components/common';
import { roles, strings } from '../../constants';
import { connect } from 'react-redux';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { maskedPhoneNumberRule, rules } from '../../helpers/validation-rules';
import { UserManagement } from '../../services';
import { getOnlyNumbers } from '../../helpers/text.helper';

const EditUserModal = (props) => {
    const [userInfo] = Form.useForm();

    const { editModalVisible, handleOk, handleCancel } = props;

    useEffect(() => {
        if (editModalVisible.record) {
            userInfo.setFieldsValue(editModalVisible.record);
        }
    }, [editModalVisible.record, userInfo])

    const rolesSelectOptions = Object.keys(roles).map(key => {
        return {
            key: roles[key],
            value: roles[key]
        }
    })

    const sitesSelectOptions = props.allSites.map(item => {
        return {
            key: item.id,
            value: item.id,
            displayValue: item.name,
        };
    });


    const handleEditUserInfo = async () => {
        try {
            const newValues = await userInfo.validateFields();

            const updateUserModel = {
                ...newValues,
                id: props.editModalVisible.record?.id,
                phoneNumber: getOnlyNumbers(newValues.phoneNumber)
            };

            await UserManagement.editUser(updateUserModel);

            handleOk();
            notification['success']({
                message: strings.USERS.NOTIFICATIONS.UPDATED_USER_SUCCESS
            });
            await props.updateUsers();
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.USERS.NOTIFICATIONS.UPDATE_USER_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    return (
        <Modal
            title={strings.USERS.PLACEHOLDERS.UPDATE_USER}
            destroyOnClose={true}
            afterClose={() => userInfo.resetFields()}
            visible={editModalVisible.visible}
            onCancel={handleCancel}
            wrapClassName="edit-user-modal"
            footer={[
                // eslint-disable-next-line react/jsx-key
                <Button onClick={handleEditUserInfo} type="primary">
                    {strings.COMMON.SUBMIT}
                </Button>
            ]}
        >
            <Form form={userInfo} name="spec-info-form">
                <Row>
                    <Col span={24}>
                        <CustomInput
                            name={strings.USERS.PROPS_NAME.USER_NAME}
                            placeHolder={strings.USERS.PLACEHOLDERS.USER_NAME}
                        />
                    </Col>
                </Row>
                <Row >
                    <Col span={24}>
                        <CustomInput
                            name={strings.USERS.PROPS_NAME.FULL_NAME}
                            placeHolder={strings.USERS.PLACEHOLDERS.FULL_NAME}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomInput
                            name={strings.USERS.PROPS_NAME.EMAIL}
                            placeHolder={strings.USERS.PLACEHOLDERS.EMAIL}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item name={strings.USERS.PROPS_NAME.IS_DISABLED}>
                            <Switch defaultChecked={props.editModalVisible.record?.isDisabled} checkedChildren={strings.USERS.PLACEHOLDERS.IS_DISABLED} unCheckedChildren={strings.USERS.PLACEHOLDERS.IS_DISABLED} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={strings.USERS.PROPS_NAME.CAN_SYNC}>
                            <Switch defaultChecked={props.editModalVisible.record?.canSync} checkedChildren={strings.USERS.PLACEHOLDERS.CAN_SYNC} unCheckedChildren={strings.USERS.PLACEHOLDERS.CAN_SYNC} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                            name={strings.USERS.PROPS_NAME.PHONE_NUMBER}
                            rules={[{ validator: maskedPhoneNumberRule }]}
                            placeHolder={strings.USERS.PLACEHOLDERS.PHONE_NUMBER} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomInput
                            name={strings.USERS.PROPS_NAME.TITLE}
                            placeHolder={strings.USERS.PLACEHOLDERS.TITLE}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomSingleOptionSelect
                            mode="multiple"
                            placeholder={strings.USERS.PLACEHOLDERS.ROLES}
                            name={strings.USERS.PROPS_NAME.ROLES}
                            options={rolesSelectOptions}
                            rules={rules}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomSingleOptionSelect
                            placeholder={strings.USERS.PLACEHOLDERS.SITES}
                            name={strings.USERS.PROPS_NAME.SITES}
                            options={sitesSelectOptions}
                            mode="multiple"
                            rules={rules}
                        />
                    </Col>
                </Row>
                {props.editModalVisible.record?.role == roles.TECHNICIAN && (
                    <Row >
                        <Col span={24}>
                            <CustomSingleOptionSelect
                                placeholder={strings.USERS.PLACEHOLDERS.ROOT_SITE}
                                name={strings.USERS.PROPS_NAME.ROOT_SITE}
                                options={sitesSelectOptions}
                                rules={rules}
                            />
                        </Col>
                    </Row>
                )}
            </Form>
        </Modal>
    )
}

const mapState = ({ authorizedLayout }) => {
    return {
        allSites: authorizedLayout.allSites,
    };
}

export default connect(mapState, null)(EditUserModal);