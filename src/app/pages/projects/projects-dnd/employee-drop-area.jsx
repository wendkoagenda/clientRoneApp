import React from 'react';
import { useDrop } from 'react-dnd';
import { Row, Col, Empty, Checkbox, Tooltip } from 'antd';
import {
    CloseCircleOutlined,
    UserOutlined,
    MailOutlined,
    SnippetsOutlined
} from '@ant-design/icons';
import { strings } from '../../../constants';
import { TextCrop } from '../../../components/common';


const EmployeeDropArea = (props) => {
    const {
        onDrop,
        contacts,
        onEmployeeRemoved,
        onPaymentStateChanged,
        onReportsDistributionOpened
    } = props;

    const [, drop] = useDrop(
        () => ({
            accept: 'employee',
            drop: (item, _monitor) => onDrop(item)
        }),
        []
    );

    return (
        <div ref={drop} className="employee-drop-area">
            {
                (!!contacts && !!contacts.length) ? (
                    contacts.map(emp => {
                        return (
                            <div key={emp.email} className="drop-card-style" style={{ background: '#00dc7d40', marginBottom: '7px' }}>
                                <Row>
                                    <Col span={7}>
                                        <UserOutlined />
                                        <TextCrop inputString={emp.fullName} title="Full name" />
                                    </Col>
                                    <Col span={6}>
                                        <MailOutlined />
                                        <TextCrop inputString={emp.email} title="Email" style={{ width: '88%' }} />
                                    </Col>
                                    <Col span={7}>
                                        <Checkbox
                                            checked={emp.isPaymentsResponsible}
                                            onChange={_e => onPaymentStateChanged(emp.id)}
                                            className="payments-checkbox" />
                                        <p>{strings.PROJECTS.PAYMENTS_RESPONSIBLE}</p>
                                    </Col>
                                    <Col span={1}>
                                        <Tooltip placement="topLeft" title={strings.COMMON.REPORTS_DISTRIBUTION}>
                                            <SnippetsOutlined onClick={() => onReportsDistributionOpened(emp.id)} />
                                        </Tooltip>
                                    </Col>
                                    <Col span={1}>
                                        <CloseCircleOutlined onClick={() => onEmployeeRemoved(emp.clientId, emp.id)} />
                                    </Col>
                                </Row>
                            </div>
                        );
                    })
                ) : (
                    <div className="employee-drop-text">
                        <Empty description={false} />
                        <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.NO_EMPLOYEES_ASSIGNED}</span>
                    </div>
                )
            }
        </div>
    );
}

export default EmployeeDropArea;