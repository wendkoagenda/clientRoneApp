import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React from 'react';

const { Dragger } = Upload;

const UploadFileModal = (props) => {

    const {
        visible,
        onOk,
        onCancel,
        uploadLabel,
        accept,
        customRequest,
        invoiceModel,
        uploadedFile,
        onPreview
    } = props;

    const uploadProps = {
        accept: accept,
        name: 'file',
        multiple: false,
        customRequest: fileProps => customRequest(fileProps, invoiceModel),
        onPreview: file => onPreview(file),
        disabled: true
    };

    return (
        <Modal
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            uploadModalVisible={false}
            footer={null}
            closable={false}
            maskClosable={true}
        >
            <Dragger {...uploadProps} fileList={[uploadedFile]}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">{uploadLabel}</p>
            </Dragger>
        </Modal>
    )
}

export default UploadFileModal;