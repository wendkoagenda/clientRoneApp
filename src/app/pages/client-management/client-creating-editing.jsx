import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { actions } from './client-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { CustomBtn, CustomInput, CustomSingleOptionSelect, CustomMaskedInput } from '../../components/common/';
import { pageNumbers, sites, strings } from '../../constants';
import ReservedEmployee from '../../components/client-management/reserved-employee';
import { CSSTransition } from 'react-transition-group';
import { Form, Checkbox, notification, Popconfirm } from 'antd';
import { getErrorMessage } from '../../services/tracking.service';
import { ClientsService, TrackingService, StatesService } from '../../services';
import history from '../../history';
import routes from '../routes';
import { rules, emailRule, maskedPhoneNumberRule, zipCodeRule } from '../../helpers/validation-rules';
import { getOnlyNumbers } from '../../helpers/text.helper';

const CreateAndEditClientPage = (props) => {
    const [clientForm] = Form.useForm();
    const [billingForm] = Form.useForm();
    const [employeeForm] = Form.useForm();
    const [isSameAddress, setSameAddress] = useState(false);
    const [addOrUpdateInProgress, setAddOrUpdateInProgress] = useState(false);

    const isSameCheckbox = useRef();
    const { editingStatus } = props;

    const clientInitial = async () => {
        if (!props.states.length) {
            try {
                const { data } = await StatesService.getAll();
                if (data && data.data && data.data.length) {
                    props.setStates(data.data);
                }
            } catch (error) {
                TrackingService.trackException(error);
                const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_STATES_ERROR);
                notification['error']({
                    message: errorMessage,
                });
            }
        }

        if (editingStatus) {
            clientForm.setFieldsValue(props.editingClient);
        }

        props.setPageInfo(props.editingStatus ? strings.PAGES.EDIT_CLIENT : strings.PAGES.ADD_CLIENT, pageNumbers.CLIENT);

        if (Object.keys(props.editingClient).length !== 0) {
            billingForm.setFieldsValue({ ...props.editingClient });
            props.reserveEmployees(props.editingClient.contacts);

            if (props.editingClient.address === props.editingClient.billingAddress &&
                props.editingClient.addressLine === props.editingClient.billingAddressLine &&
                props.editingClient.city === props.editingClient.billingCity &&
                props.editingClient.state.name === props.editingClient.billingState.name &&
                props.editingClient.zipCode === props.editingClient.billingZipCode) {
                setSameAddress(true);
                isSameCheckbox.current.state.checked = true;
            }

            if (props.editingClient.site == 'Rone') {
                props.changeLogoState(true);
            }
            else {
                props.changeLogoState(false);
            }
        }
    }

    useEffect(() => {
        props.setGlobalSpinState(true);
        clientInitial().then(() => {
            props.setGlobalSpinState(false);
        })
    }, [props.editingClient])

    const reserveEmployee = async () => {
        const employeeData = await employeeForm.validateFields();

        props.reserveEmployee(employeeData);

        employeeForm.resetFields();
    }

    const addOrUpdateClient = async () => {
        try {
            setAddOrUpdateInProgress(true);
            let clientModel = {};
            const clientData = await clientForm.validateFields();

            clientData.officeNumber = getOnlyNumbers(clientData.officeNumber);

            let billingData = {};

            if (isSameAddress) {
                billingData = {
                    billingAddress: clientData.address,
                    billingAddressLine: clientData.addressLine,
                    billingCity: clientData.city,
                    billingState: clientData.state,
                    billingZipCode: clientData.zipCode
                }
            }
            else {
                billingData = await billingForm.validateFields();
            }

            clientModel = {
                ...clientData,
                ...billingData,
                contacts: [...props.reservedEmployee]
            }

            clientModel.country = 'USA';
            clientModel.site = sites.RONE;
            clientModel.contacts.forEach(item => {
                item.country = 'USA';
                item.contactNumberOffice = getOnlyNumbers(item.contactNumberOffice);
                item.contactNumberCell = getOnlyNumbers(item.contactNumberCell);
            });

            if (editingStatus) {
                clientModel.id = props.editingClient.id;
                await ClientsService.editClient(clientModel);
                props.clearEditable();
            }
            else {
                await ClientsService.createClient(clientModel);
            }

            history.push(routes.MANAGE_CLIENTS);

            notification['success']({
                message: editingStatus ? strings.CLIENT_PAGE.NOTIFICATIONS.EDIT_SUCCESSFUL : strings.CLIENT_PAGE.NOTIFICATIONS.CREATE_SUCCESSFUL,
            });
        }
        catch (error) {
            setAddOrUpdateInProgress(false);
            console.log(error);
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, editingStatus ? strings.CLIENT_PAGE.NOTIFICATIONS.EDIT_ERROR : strings.CLIENT_PAGE.NOTIFICATIONS.CREATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const reservedEmployeeCards = props.reservedEmployee.map((item) =>
        <ReservedEmployee key={item.key} form={employeeForm} employee={item} />
    );

    const stateSelectOptions = props.states.map(state => {
        return {
            key: state.id,
            value: state.name
        };
    });

    const onDefaultPhoneNumberChange = (e) => {
        employeeForm.setFieldsValue({
            contactNumberOffice: e.target.value,
            contactNumberCell: e.target.value
        })
    };

    return (
        <div className="create-edit-client-layout">
            <h2>{strings.CLIENT_PAGE.INPUT_LABELS.CLIENT_DETAILS}</h2>
            <div className="client-details">
                <Form form={clientForm} name="client-form">
                    <div className="input-custom-row">
                        <CustomInput name="companyId" rules={rules} placeHolder={strings.COMMON.COMPANY_ID} />
                        <CustomInput name="company" rules={rules} placeHolder={strings.COMMON.COMPANY_NAME} />
                        <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                            name="officeNumber"
                            rules={[{ validator: maskedPhoneNumberRule }]}
                            placeHolder={strings.COMMON.OFFICE_NUMBER}
                            onInputChange={onDefaultPhoneNumberChange} />
                    </div>
                    <div className="input-custom-row">
                        <CustomInput name="address" rules={rules} placeHolder={strings.COMMON.ADDRESS} />
                        <CustomInput name="addressLine" placeHolder={strings.COMMON.ADDRESS2} />
                        <CustomInput name="city" rules={rules} placeHolder={strings.COMMON.CITY} />
                    </div>
                    <div className="input-custom-row">
                        <CustomSingleOptionSelect placeholder={strings.COMMON.STATE} name="state" options={stateSelectOptions} rules={rules} />
                        <CustomInput name="zipCode" rules={zipCodeRule} placeHolder={strings.COMMON.ZIP} />
                        <div className="empty-div"></div>
                    </div>
                </Form>
            </div>
            <h2>{strings.CLIENT_PAGE.INPUT_LABELS.BILLING}</h2>
            <div className="billing-details">
                <div className="custom-checkbox">
                    <Checkbox ref={isSameCheckbox} onChange={(e) => setSameAddress(e.target.checked)} defaultChecked={false}>{strings.COMMON.SAME_ADDRESS}</Checkbox>
                </div>
                <CSSTransition
                    in={!isSameAddress}
                    timeout={400}
                    classNames="billing-address"
                    unmountOnExit
                >
                    <div>
                        <Form form={billingForm} name="billing-form">
                            <div className="input-custom-row">
                                <CustomInput name="billingAddress" rules={rules} placeHolder={strings.COMMON.ADDRESS} />
                                <CustomInput name="billingAddressLine" placeHolder={strings.COMMON.ADDRESS2} />
                                <CustomInput name="billingCity" rules={rules} placeHolder={strings.COMMON.CITY} />
                            </div>
                            <div className="input-custom-row">
                                <CustomSingleOptionSelect placeholder={strings.COMMON.STATE} name="billingState" options={stateSelectOptions} rules={rules} />
                                <CustomInput name="billingZipCode" rules={zipCodeRule} placeHolder={strings.COMMON.ZIP} />
                                <div className="empty-div"></div>
                            </div>
                        </Form>
                    </div>
                </CSSTransition>
            </div>
            <h2>{strings.CLIENT_PAGE.INPUT_LABELS.CONTACT_NAMES}</h2>
            <div className="employee-details">
                <div style={{ marginBottom: '30px', marginTop: '10px' }}>
                    {
                        reservedEmployeeCards
                    }
                </div>
                <Form form={employeeForm} name="employee-form">
                    <div className="single-row-input">
                        <CustomInput name="fullName" rules={rules} placeHolder={strings.COMMON.CONTACT_NAME} />
                    </div>
                    <div className="input-custom-row">
                        <CustomInput name="address" rules={rules} placeHolder={strings.COMMON.ADDRESS} />
                        <CustomInput name="addressLine" placeHolder={strings.COMMON.ADDRESS2} />
                        <CustomInput name="city" rules={rules} placeHolder={strings.COMMON.CITY} />
                    </div>
                    <div className="input-custom-row">
                        <CustomSingleOptionSelect placeholder={strings.COMMON.STATE} name="state" options={stateSelectOptions} rules={rules} />
                        <CustomInput name="zipCode" rules={zipCodeRule} placeHolder={strings.COMMON.ZIP} />
                        <div className="empty-div"></div>
                    </div>
                    <div className="input-custom-row">
                        <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                            name="contactNumberOffice"
                            rules={[{ validator: maskedPhoneNumberRule }]}
                            placeHolder={strings.COMMON.CONTACT_NUMBER_OFFICE} />
                        <CustomMaskedInput inputMask={strings.FIELD_FORMATS.DEFAULT_PHONE_NUMBER_MASK}
                            name="contactNumberCell"
                            rules={[{ validator: maskedPhoneNumberRule }]}
                            placeHolder={strings.COMMON.CONTACT_NUMBER_CELL} />
                        <CustomInput name="email" rules={emailRule} placeHolder={strings.COMMON.EMAIL} />
                    </div>
                </Form>
                <CustomBtn type="default" onClick={reserveEmployee} name={strings.COMMON.ADD_CONTACT} />
            </div>
            <div className="custom-divider"></div>
            <div className="add-client-btn">
                <Popconfirm
                    placement="top"
                    title={strings.COMMON.CANCEL_BUTTON_CONFIRM}
                    onConfirm={() => history.goBack()}
                    okText={strings.COMMON.OK}
                    cancelText={strings.COMMON.CANCEL}
                >
                    <CustomBtn type="default" name="Cancel" />
                </Popconfirm>
                {
                    !editingStatus ? (
                        <Popconfirm
                            placement="top"
                            title={strings.COMMON.ADD_NEW_CLIENT_CONFIRM}
                            onConfirm={addOrUpdateClient}
                            okText={strings.COMMON.OK}
                            cancelText={strings.COMMON.CANCEL}
                        >
                            <CustomBtn type="primary" name={strings.COMMON.ADD_CLIENT} />
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            placement="top"
                            title={strings.COMMON.SAVE_CHANGES_CONFIRM}
                            onConfirm={addOrUpdateClient}
                            okText={strings.COMMON.OK}
                            cancelText={strings.COMMON.CANCEL}
                        >
                            <CustomBtn isLoading={addOrUpdateInProgress} type="primary" name={strings.COMMON.SAVE_CHANGES} />
                        </Popconfirm>
                    )
                }
            </div>
        </div>
    )
}

const mapState = ({ clientManagement, authorizedLayout }) => {
    return {
        clients: clientManagement.clients,
        reservedEmployee: clientManagement.reservedEmployee,
        currentUser: authorizedLayout.user,
        allSites: authorizedLayout.allSites,
        clientSites: clientManagement.clientSites,
        editingStatus: clientManagement.editingStatus,
        editingClient: clientManagement.editingClient,
        states: authorizedLayout.states
    };
}

const mapDispatch = (dispatch) => {
    return {
        reserveEmployee(value) {
            dispatch(actions.reserveEmployee(value));
        },
        reserveEmployees(value) {
            dispatch(actions.reserveEmployees(value));
        },
        setUserSites(value) {
            dispatch(actions.setClientSites(value));
        },
        clearEditable() {
            dispatch(actions.clearEditable());
        },
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setStates(states) {
            dispatch(globalActions.setStates(states));
        },
        changeLogoState(value) {
            dispatch(globalActions.setValue('isRoneLogo', value))
        }
    }
}

export default connect(mapState, mapDispatch)(CreateAndEditClientPage);