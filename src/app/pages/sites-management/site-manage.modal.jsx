import React, { useEffect } from 'react';
import { Col, Form, Modal, Row } from 'antd';
import { CustomInput } from '../../components/common';
import { rules } from '../../helpers/validation-rules';


const SiteManageModal = (props) => {
    const [siteForm] = Form.useForm();

    const handleSubmit = async () => {
        const siteModel = await siteForm.validateFields();

        await props.onOk({
            id: props.site ? props.site.id : 0,
            name: siteModel.name,
            address: siteModel.address,
            travelCharge: siteModel.travelCharge
        });

        siteForm.resetFields();
    };

    const handleCancel = () => {
        siteForm.resetFields();
        props.onCancel();
    };

    useEffect(() => {
        props.site ? siteForm.setFieldsValue({ name: props.site.name, address: props.site.address }) : siteForm.resetFields();
    }, [props.site, siteForm]);

    return (
        <Modal title={props.title} visible={props.visible} onOk={handleSubmit} onCancel={handleCancel}>
            <Form form={siteForm} name="site-form">
                <Row>
                    <Col span={24}>
                        <CustomInput name="name" rules={rules} placeHolder={"Site Name"} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomInput name="address" placeHolder={"Site Address"} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <CustomInput name="travelCharge" placeHolder={"Travel Charge"} />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default SiteManageModal;