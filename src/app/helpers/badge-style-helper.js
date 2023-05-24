import React from 'react';
import { Divider } from 'antd';
import { colorShades, strings, workOrderStatuses } from "../constants";

export const getOrderBadgeColor = (order) => {
    if (order) {
        const orderNumber = order.workOrder.id.toString();
        let digitSum = 0;

        for (let i = 0; i < orderNumber.length; i += 1) {
            digitSum += parseInt(orderNumber.charAt(i));
        }

        const lastDigit = digitSum.toString().charAt(digitSum.toString().length - 1);

        if (order.statusId === workOrderStatuses.Opened && order.technicianId) {
            return colorShades.RED[lastDigit];
        }
        if (order.statusId === workOrderStatuses.InProgress && !order.isConfirmed) {
            return colorShades.YELLOW[lastDigit];
        }
        if (order.statusId === workOrderStatuses.InProgress && order.isConfirmed) {
            return colorShades.GREEN[lastDigit];
        }
        if (order.statusId === workOrderStatuses.Completed) {
            return colorShades.BLUE[lastDigit];
        }
    }

    return '#878787';
}

export const orderDetailsPopover = (orderItems) => {
    const technician = orderItems?.technician
    const technicianFullName = orderItems?.technician?.fullName
    return (
        <div className="details-popover">
            {/* {
                technician
                    ? technicianFullName
                        ? <p>{strings.BADGE_LABELS.TECHNICIAN}<span>{technicianFullName}</span></p>
                        : <p>{strings.BADGE_LABELS.TECHNICIAN}<span>{technician}</span></p>
                    : <></>
            }
            {!orderItems.workOrder.parentWorkOrderId &&
                <p>Work Order Number: <span>{orderItems.workOrder.id}</span></p>
            } */}
            <p>Work Order Type: <span>{orderItems.workOrder.title}</span></p>
            <p>Work Order Category: <span>{orderItems.workOrder.category}</span></p>
            <p>Work Order Estimated Date: <span>{orderItems.workOrder.startDate.toUTCKind().convertToEST('HH:mm')}</span></p>
            {/* <Divider />
            <p>Project Name: <span>{orderItems.project.name}</span></p>
            <p>Project Number: <span>{orderItems.project.number}</span></p>
            <p>Project Address: <span>{orderItems.project.address}</span></p>
            <p>Project City: <span>{orderItems.project.city}</span></p>
            <p>Project ZIP: <span>{orderItems.project.zipCode}</span></p>
            <p>Project Country: <span>{orderItems.project.country}</span></p>
            <Divider />
            <p>Business Party Company: <span>{orderItems.client?.company}</span></p>
            <p>Business Party Address: <span>{orderItems.client?.address}</span></p>
            <p>Business Party City: <span>{orderItems.client?.city}</span></p>
            <p>Business Party ZIP: <span>{orderItems.client?.zipCode}</span></p>
            <p>Business Party Country: <span>{orderItems.client?.country}</span></p>
            <Divider />
            {orderItems.contact &&
                <>
                    <p>Contact Name: <span>{orderItems.contact.fullName}</span></p>
                    <p>Contact Email: <span>{orderItems.contact.email}</span></p>
                    <p>Contact Office Number: <span>{orderItems.contact.contactNumberOffice}</span></p>
                    <p>Contact Cell Number: <span>{orderItems.contact.contactNumberCell}</span></p>
                </>
            } */}
        </div>
    )
}

export const badgeMaxSize = (cellsCount) => {
    const lettersInCell = 6;
    const firstCell = 1;
    return (cellsCount - firstCell) * lettersInCell
}