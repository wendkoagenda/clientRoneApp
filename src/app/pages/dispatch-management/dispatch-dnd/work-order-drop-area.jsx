import React from 'react';
import { useDrop } from 'react-dnd';
import { strings, workOrderStatuses } from '../../../constants';
import { Empty } from 'antd';
import WorkOrderCard from './work-order-card';

const WorkOrderDropArea = (props) => {
    const { onDrop, workOrders, handleFullTime, onWorkOrderRemoved, onDateRangeChanged, setTestsModal, createPickupRequest } = props;

    const [, drop] = useDrop(
        () => ({
            accept: 'workOrder',
            drop: (item, monitor) => onDrop(item)
        }),
        []
    );

    const isTestDisabled = (item) => {
        return item.statusId === workOrderStatuses.Completed || !!item.dispatchRequestWorkOrderConcreteTests?.some(test => test.ageTested ||
            test.area ||
            test.compressiveStrength ||
            test.diameter ||
            test.fracture ||
            test.maximumLoad ||
            test.testedBy);
    }

    return (
        <div ref={drop} className="dispatch-drop-area">
            {
                (!!workOrders && !!workOrders.length)
                    ? workOrders.map(item =>
                        <WorkOrderCard
                            key={item.id}
                            orderId={item.id}
                            orderType={item.title}
                            startDate={item.startDate}
                            endDate={item.endDate}
                            onRemove={() => onWorkOrderRemoved(item.id)}
                            onDateRangeChanged={onDateRangeChanged}
                            isFullTime={item.isFullTimeWorkOrder}
                            handleFullTime={handleFullTime}
                            notes={item.notes}
                            isTestDisabled={isTestDisabled(item)}
                            isLaboratoryPresented={item.isLaboratoryPresented}
                            isPickupJob={!!item.parentWorkOrderId}
                            setTestsModal={setTestsModal}
                            createPickupRequest={createPickupRequest}
                        />
                    )
                    : (
                        <div className="dispatch-drop-text">
                            <Empty description={false} />
                            <span>{strings.DISPATCH.LABELS.NO_WORK_ORDERS_ASSIGNED}</span>
                        </div>
                    )
            }
        </div>
    );
}

export default WorkOrderDropArea;