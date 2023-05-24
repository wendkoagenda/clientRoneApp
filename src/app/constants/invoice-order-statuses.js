const invoiceOrderStatusesWithNames = [
    {
        id: 0,
        name: 'Not set'
    },
    {
        id: 1,
        name: 'Created'
    },
    {
        id: 2,
        name: 'Assigned'
    },
    {
        id: 3,
        name: 'Working'
    },
    {
        id: 4,
        name: 'Ready to invoice'
    },
    {
        id: 5,
        name: 'Invoiced'
    },
    {
        id: 6,
        name: 'Signed'
    }
]

export const invoiceExtraMetricDescription = [
    {
        id: 0,
        name: 'Time on site',
    },
    {
        id: 1,
        name: 'Travel charge to site',
    },
    {
        id: 2,
        name: 'Travel charge from site'
    },
    {
        id: 3,
        name: 'Overtime'
    },
    {
        id: 4,
        name: 'Admin time'
    },
    {
        id: 5,
        name: 'Transportation charge to'
    },
    {
        id: 6,
        name: 'Transportation charge from'
    },
    {
        id: 7,
        name: 'Transportation charge to/from'
    }
]

export const metricInvoiceStatuses = [
    {
        value: true,
        name: 'Invoiced'
    },
    {
        value: false,
        name: 'Ready to invoice'
    }
]

export const invoiceOrderStatuses = {
    UNDEFINED: 0,
    CREATED: 1,
    ASSIGNED: 2,
    WORKING: 3,
    READY_TO_INVOICE: 4,
    INVOICED: 5,
    SIGNED: 6
}

export default invoiceOrderStatusesWithNames;