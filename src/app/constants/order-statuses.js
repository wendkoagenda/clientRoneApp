/**
 * Enum for work order status.
 * @readonly
 * @enum {{name: string, hex: number}}
 */
export const workOrderStatuses = {
    Opened: 1,
    InProgress: 2,
    Completed: 3,
    Cancelled: 4
};

/**
 * Enum for work order status requests.
 * @readonly
 * @enum {{name: string, hex: number}}
 */
export const workOrderUIStatuses = {
    Created: 1,
    Assigned: 2,
    Notified: 3,
    Confirmed: 4,
    ReportSubmitted: 5
}

export const getWorkOrderStatus = (value) => {
    return Object.keys(workOrderStatuses).find(key => workOrderStatuses[key] === value);
};

export default workOrderStatuses;