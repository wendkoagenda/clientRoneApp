import React, { useState } from 'react';
import { TrackingService, SignatureService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { strings } from '../../constants';
import {
    Upload,
    message,
    notification
} from 'antd';
import {
    LoadingOutlined,
    PlusOutlined
} from '@ant-design/icons';


const UserSignature = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadImage = async ({ file }) => {
        try {
            const uploadResponse = await SignatureService.uploadSignature(file, props.userId);

            await props.onUploadFinished();

            if (uploadResponse.status == 200) {
                notification['success']({
                    message: strings.COMMON.EDIT_SUCCESSFUL,
                });
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_ERROR);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    const handleChange = info => {
        if (info.file.status === 'uploading') {
            setIsLoading(true);

            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setIsLoading(false);
            });
        }
    };

    const uploadButton = (
        <div>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Upload
            accept="image/*"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={uploadImage}
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            {props.image ? <img src={`data:image/png;base64,${props.image}`} alt="signature" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
    );
};

export default UserSignature;