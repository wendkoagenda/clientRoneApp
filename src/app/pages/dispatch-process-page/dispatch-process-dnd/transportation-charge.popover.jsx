import React, { useState } from 'react';
import { CarOutlined } from '@ant-design/icons';
import { notification, Popover, Radio } from 'antd';
import { strings, transportationCharges, workOrderStatuses } from '../../../constants';
import { DispatchService, TrackingService } from '../../../services';
import { getErrorMessage } from '../../../services/tracking.service';
import NoneTransportationChargeModal from './noneTransportationCharge';
import { getWOEndDate, getWOStartDate } from '../../../helpers/date-time-helper';
import moment from 'moment';
import { DEFAULT_UTC_OFFSET } from '../../../helpers/timeline-helper';

const TransportationChargePopover = (props) => {
    const [isNoneTransportationChargeModalVisible, setNoneTransportationChargeModalVisible] = useState(false);
    const [isPopoverVisible, setPopoverVisible] = useState(false);

    const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
    const [transportationChargeId, setTransportationChargeId] = useState();

    const {
        assignedOrder,
        assignedWorkOrders
    } = props;

    const handleVisibleChange = (visible) => {
        setPopoverVisible(visible);
    };

    const changeTransportationCharge = async (value) => {
        try {
            if (value === transportationCharges[3].id) {
                setFilteredWorkOrders(assignedWorkOrders.filter(wo => moment.utc(wo.startAt).utcOffset(DEFAULT_UTC_OFFSET).format() >= getWOStartDate(assignedOrder.startAt) &&
                    moment.utc(wo.startAt).utcOffset(DEFAULT_UTC_OFFSET).format() < getWOEndDate(assignedOrder.startAt) &&
                    wo.technicianId === assignedOrder.technicianId &&
                    wo.statusId !== workOrderStatuses.Completed &&
                    wo.id !== assignedOrder.id &&
                    wo.transportationChargeId !== transportationCharges[3].id));

                setTransportationChargeId(value);
                setPopoverVisible(false);
                setNoneTransportationChargeModalVisible(true);
            } else {
                await DispatchService.changeTransportationChargeId({
                    dispatchRequestId: assignedOrder.dispatchRequestId,
                    workOrderId: assignedOrder.workOrderId,
                    transportationCharge: value
                });
                setPopoverVisible(false);
            }
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_ASSIGN);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const transportationChargeCheckboxes = (
        <Radio.Group
            value={assignedOrder.transportationChargeId}
            onChange={(e) => changeTransportationCharge(e.target.value)}
        >
            {
                transportationCharges.map(item =>
                    <Radio
                        key={item.id}
                        value={item.id}
                        onClick={(e) => Number(e.target.value) === transportationCharges[3].id ? changeTransportationCharge(Number(e.target.value)) : null}>
                        {item.label}
                    </Radio>
                )
            }
        </Radio.Group>
    )

    return (
        <Popover
            overlayClassName="transportation-charge-popover"
            trigger="click"
            title={strings.COMMON.TRANSPORTATION_CHARGE}
            content={transportationChargeCheckboxes}
            visible={isPopoverVisible && !isNoneTransportationChargeModalVisible}
            onVisibleChange={handleVisibleChange}
        >
            <CarOutlined className="transportation-charge-btn" />
            <NoneTransportationChargeModal
                isModalVisible={isNoneTransportationChargeModalVisible}
                onCancel={() => setNoneTransportationChargeModalVisible(false)}
                assignedOrder={assignedOrder}
                assignedWorkOrders={filteredWorkOrders}
                transportationChargeId={transportationChargeId}
            />
        </Popover>
    )
}

export default TransportationChargePopover;
