import { Col, Modal, Row, Form, Button, notification, Checkbox } from 'antd';
import React, { useState } from 'react';
import { CustomInput } from '../../components/common';
import { strings } from '../../constants';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { rules } from '../../helpers/validation-rules';
import { BudgetService } from '../../services';

const CreateWorkOrderModal = ({
    workOrderModalVisible,
    onCancel,
    onWorkOrderCreated }) => {
    const [workOrderForm] = Form.useForm();
    const [isPricingItem, setIsPricingItem] = useState(false);

    const createNewWorkOrder = async () => {
        try {
            const workOrderModel = await workOrderForm.validateFields();

            await BudgetService.createWorkOrder(workOrderModel);
            await onWorkOrderCreated();

            notification['success']({
                message: strings.WORK_ORDERS_MANAGEMENT.NOTIFICATIONS.WORK_ORDER_ADDED
            });

            onCancel();
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.WORK_ORDERS_MANAGEMENT.ERRORS.UNABLE_TO_CREATE_WORK_ORDER);
            notification['error']({
                message: errorMessage
            });
        }
    };

    return (
        <Modal
            title={strings.WORK_ORDERS_MANAGEMENT.LABELS.CREATE_NEW_WORK_ORDER}
            destroyOnClose={true}
            afterClose={() => workOrderForm.resetFields()}
            visible={workOrderModalVisible}
            onCancel={onCancel}
            wrapClassName="edit-user-modal"
            footer={[
                <Button key="create-work-order" onClick={createNewWorkOrder} type="primary">
                    {strings.COMMON.SUBMIT}
                </Button>
            ]}
        >
            <Form form={workOrderForm} name="spec-info-form">
                <Row>
                    <Col span={24}>
                        <CustomInput
                            name="category"
                            placeHolder="Section"
                            rules={rules}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomInput
                            name="title"
                            placeHolder="Description"
                            rules={rules}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={isPricingItem ? 24 : 12}>
                        <CustomInput
                            style={{ width: !isPricingItem && "90%" }}
                            name="level1"
                            placeHolder="Level 1"
                        />
                    </Col>
                    {!isPricingItem && (
                        <Col span={12}>
                            <CustomInput
                                style={{ width: "90%" }}
                                name="level2"
                                placeHolder="Level 2"
                            />
                        </Col>
                    )}
                </Row>
                {!isPricingItem && (
                    <>
                        <Row>
                            <Col span={12}>
                                <CustomInput
                                    style={{ width: "90%" }}
                                    name="level3"
                                    placeHolder="Level 3"
                                />
                            </Col>
                            <Col span={12}>
                                <CustomInput
                                    style={{ width: "90%" }}
                                    name="level4"
                                    placeHolder="Level 4"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <CustomInput
                                    style={{ width: "90%" }}
                                    name="level5"
                                    placeHolder="Level 5"
                                />
                            </Col>
                            <Col span={12}>
                                <CustomInput
                                    style={{ width: "90%" }}
                                    name="level6"
                                    placeHolder="Level 6"
                                />
                            </Col>
                        </Row>
                    </>
                )}
                <Row>
                    <Col className="checkbox-dropdown">
                        <Form.Item name="isPricingItem" valuePropName="checked">
                            <Checkbox onChange={e => setIsPricingItem(e.target.checked)}>{strings.WORK_ORDERS_MANAGEMENT.LABELS.IS_PRICING_ITEM}</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default CreateWorkOrderModal;