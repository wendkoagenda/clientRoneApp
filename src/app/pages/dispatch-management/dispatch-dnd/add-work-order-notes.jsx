import { Form, Modal, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { TextCrop } from '../../../components/common';
import { strings } from '../../../constants';
import { actions } from '../dispatch-reducer';

const { TextArea } = Input;

const AddWorkOrderNotes = (props) => {
    const { isModalVisible, onClosed, orderId, setNotesWorkOrder, initialValue, orderType } = props;
    const [notes, setNotes] = useState("");

    const handleOk = () => {
        setNotesWorkOrder(orderId, notes);
        onClosed();
    };

    useEffect(() => {
        setNotes(initialValue);
    }, [initialValue]);

    return (
        <Modal
            title={<TextCrop inputString={`Add Notes - ${orderType}`} />}
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={onClosed}
        >
            <Form.Item name="notes">
                <TextArea
                    className="dispatch-notes-component"
                    placeholder={strings.DISPATCH.LABELS.NOTES}
                    onChange={(e) => setNotes(e.target.value)}
                    defaultValue={initialValue} allowClear />
            </Form.Item>
        </Modal>
    );
};

const mapDispatch = (dispatch) => {
    return {
        setNotesWorkOrder(id, value) {
            dispatch(actions.setNotesWorkOrder(id, value))
        }
    }
}

export default connect(null, mapDispatch)(AddWorkOrderNotes);