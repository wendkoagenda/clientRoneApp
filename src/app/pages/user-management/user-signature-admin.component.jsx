import React, { useState, useEffect } from 'react';
import { SignatureService } from '../../services';
import {
    Modal
} from 'antd';
import UserSignature from './user-signature.component';
import { strings } from '../../constants';


const UserSignatureAdminComponent = (props) => {
    const [signatureImage, setSignatureImage] = useState('');

    useEffect(async () => {
        if (props.userId) {
            const signatureResponse = await SignatureService.getSignature(props.userId);
            if (signatureResponse?.data?.data) {
                setSignatureImage(signatureResponse.data.data.image);
            }
        }
    }, [props.userId]);

    return (
        <Modal
            className="signature-component"
            title="User Signature"
            visible={props.visible}
            onCancel={props.onClose}
            width="470px"
            footer={false}
        >
            <p>{strings.INPUT_RULES.SIGNATURE_IMAGE}</p>
            <UserSignature
                image={signatureImage}
                userId={props.userId}
                onUploadFinished={props.onUploadFinished} />
        </Modal>
    );
};

export default UserSignatureAdminComponent;