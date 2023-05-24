import React from 'react';
import { connect } from 'react-redux';
import { actions } from '../../pages/client-management/client-reducer';
import {
    UserOutlined,
    HomeOutlined,
    EditOutlined,
    MailOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

const ReservedEmployee = (props) => {

    const addressString = [props.employee.address, props.employee.addressLine, props.employee.city, props.employee.state, props.employee.zipCode, props.employee.country].join(', ');

    const editEmployee = (key) => {
        props.deleteEmployee(key);
        props.form.setFieldsValue(props.employee);
    }

    return (
        <div className="reserved-employee-body">
            <div className="property-block" style={{ width: '25%' }}>
                <UserOutlined />
                <p>{props.employee.fullName}</p>
            </div>
            <div className="property-block" style={{ width: '35%' }}>
                <HomeOutlined />
                <p>{addressString.substring(0, 40)}</p>
            </div>
            <div className="property-block" style={{ width: '30%' }}>
                <MailOutlined />
                <p>{props.employee.email}</p>
            </div>
            <div className="property-block actions" style={{ width: '7%' }}>
                <EditOutlined onClick={() => editEmployee(props.employee.key)} />
                <CloseCircleOutlined onClick={() => props.deleteEmployee(props.employee.key)} />
            </div>
        </div>
    )
}

const mapDispatch = (dispatch) => {
    return {
        deleteEmployee(key) {
            dispatch(actions.deleteReservedEmployee(key));
        },
    }
}

export default connect(null, mapDispatch)(ReservedEmployee);