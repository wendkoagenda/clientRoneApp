import { Modal, Radio } from 'antd';
import React, { useState } from 'react';
import { strings } from '../../../constants';
import { DEFAULT_UTC_OFFSET } from '../../../helpers/timeline-helper';
import { DispatchService } from '../../../services';
import moment from 'moment';
import Text from 'antd/lib/typography/Text';

const NoneTransportationChargeModal = (props) => {

    const { isModalVisible, onCancel, assignedOrder, assignedWorkOrders, transportationChargeId } = props;

    const [noneTransportationChargeParentDispatchRequestWorkOrderId, setNoneTransportationChargeParentDispatchRequestWorkOrderId] = useState(assignedOrder.noneTransportationChargeParentDispatchRequestWorkOrderId);

    const workOrders = (item) => [
        item.project.name,
        " ",
        item.workOrder.title,
        " ",
        item.id.toString(),
        " ",
        moment.utc(item.startAt).utcOffset(DEFAULT_UTC_OFFSET).format('HH:mm'),
        " - ",
        moment.utc(item.endAt).utcOffset(DEFAULT_UTC_OFFSET).format('HH:mm')
    ]

    const onChange = (value) => {
        setNoneTransportationChargeParentDispatchRequestWorkOrderId(value);
    };

    const handleOk = async () => {
        await DispatchService.changeTransportationChargeId({
            dispatchRequestId: assignedOrder.dispatchRequestId,
            workOrderId: assignedOrder.workOrderId,
            transportationCharge: transportationChargeId,
            noneTransportationChargeParentDispatchRequestWorkOrderId: noneTransportationChargeParentDispatchRequestWorkOrderId
        });
        onCancel();
    };

    return (
        <Modal
            title={strings.COMMON.NONE_TRANSPORTATION_CHARGE_MODAL}
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={onCancel}
            wrapClassName={'transportation-charge-modal'}
        >
            <Radio.Group
                value={noneTransportationChargeParentDispatchRequestWorkOrderId}
                onChange={(e) => onChange(e.target.value)}
            >
                {
                    assignedWorkOrders.map(item =>
                        <Radio
                            key={item.id}
                            value={item.id}>
                            <Text className="text" ellipsis={{tooltip: workOrders(item)}}> {workOrders(item)} </Text> 
                        </Radio>
                    )
                }
            </Radio.Group>
        </Modal>
    );
}

export default NoneTransportationChargeModal;