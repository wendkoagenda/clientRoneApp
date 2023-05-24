import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, notification } from 'antd';
import { adminTimeCalculationTypes, adminTimeCalculationTypesDescription, adminTypesProps } from '../../constants/admin-time';
import { CustomSingleOptionSelect } from '../../components/common';
import { strings } from '../../constants';
import { BudgetService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';

const AdminTimeRow = (props) => {

    const {
        record
    } = props;

    const [adminTimeForm] = Form.useForm();
    const [isAdminTimeLoading, setAdminTimeLoading] = useState(false);

    const [reportsOptionSelected, setReportsOptionSelected] = useState(record?.adminTime?.adminTimeCalculationTypeId == adminTimeCalculationTypesDescription.Report);

    const onCalculationTypeChanged = (key) => {
        setReportsOptionSelected(key == adminTimeCalculationTypesDescription.Report);
    };

    const adminTimeCalculationTypeSelectOptions = adminTimeCalculationTypes.map(item => {
        return {
            key: item.id,
            value: item.id,
            displayValue: item.value
        };
    });

    const handleAdminTime = async () => {
        setAdminTimeLoading(true);
        try {
            const adminTime = await adminTimeForm.validateFields();

            Object.keys(adminTime).forEach(key => {
                if (adminTime[key] === null || adminTime[key] === '' || adminTime[key] === undefined) {
                    delete adminTime[key];
                }
            });

            await BudgetService.upsertBudgetSheetRecord({
                ...record,
                adminTime: {
                    ...record.adminTime,
                    ...adminTime
                }
            });

            notification['success']({
                message: strings.COMMON.BUDGET_SHEET_EDIT_SUCCESS,
            });

        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_BUDGET_SHEET_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setAdminTimeLoading(false);
    }

    return (
        <Form form={adminTimeForm} className="admin-time-form">
            <Row gutter={[16, 16]}>
                <Col span={3} offset={3}>
                    <p>Admin Time</p>
                </Col>
                <Col span={2} offset={3} className="metric-title-cell">
                    <p>Rate</p>
                </Col>
                {
                    adminTypesProps.RATE.map((item, index) => (
                        <Col key={index} span={2} className="input-cell">
                            <Form.Item
                                name={item}
                                style={{
                                    margin: 0,
                                }}
                            >
                                <Input defaultValue={record?.adminTime?.[item]} placeholder="n/a" type="number" />
                            </Form.Item>
                        </Col>
                    ))
                }
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={2} offset={9} className="metric-title-cell">
                    <p>Starting Quantity</p>
                </Col>
                {
                    adminTypesProps.MINIMUM.map((item, index) => (
                        <Col key={index} span={2} className="input-cell">
                            <Form.Item
                                name={item}
                                style={{
                                    margin: 0,
                                }}
                            >
                                <Input defaultValue={record?.adminTime?.[item]} placeholder="n/a" type="number" />
                            </Form.Item>
                        </Col>
                    ))
                }
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={2} offset={9} className="metric-title-cell">
                    <p>Increment</p>
                </Col>
                {
                    adminTypesProps.INCREMENT.map((item, index) => (
                        <Col key={index} span={2} className="input-cell">
                            <Form.Item
                                name={item}
                                style={{
                                    margin: 0,
                                }}
                            >
                                <Input
                                    disabled={reportsOptionSelected}
                                    defaultValue={record?.adminTime?.[item]}
                                    placeholder={"n/a"}
                                    type="number" />
                            </Form.Item>
                        </Col>
                    ))
                }
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={2} offset={9} className="metric-title-cell">
                    <p>Per</p>
                </Col>
                <Col span={2}>
                    <Form.Item
                        name="perNumber"
                        style={{
                            margin: 0,
                        }}
                    >
                        <Input
                            disabled={reportsOptionSelected}
                            defaultValue={record?.adminTime?.perNumber}
                            placeholder="n/a"
                            type="number" />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <CustomSingleOptionSelect
                        placeholder="Type"
                        name="adminTimeCalculationTypeId"
                        options={adminTimeCalculationTypeSelectOptions}
                        defaultValue={record?.adminTime?.adminTimeCalculationTypeId}
                        handleChange={onCalculationTypeChanged}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={1} offset={22}>
                    <Button loading={isAdminTimeLoading} onClick={handleAdminTime} type="primary">
                        {strings.COMMON.SUBMIT}
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default AdminTimeRow;