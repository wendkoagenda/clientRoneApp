import React, { useState, useEffect } from 'react';
import { Table, notification, Button } from 'antd';
import { actions } from './reports-reducer';
import { connect } from 'react-redux';
import { strings } from '../../constants';
import { formatPhoneNumber } from '../../helpers/text.helper';
import TextCrop from '../../components/common/text-crop';
import ReportRevisionComponent from './report-revision.component';
import { ReportsService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';


const ContactsNested = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const loadScheduledContacts = async () => {
        try {
            const notificationResponse = await ReportsService.loadSelectedContacts(props.record.dispatchRequestWorkOrderId);
            props.setAllSelectedContactsKeys(props.record.dispatchRequestWorkOrderId, notificationResponse.data.data.map(item => item.projectContactId));

        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_LOAD_SCHEDULED_NOTIFICATIONS);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    // useEffect(async () => {
    //     if (props.record) {
    //         await loadScheduledContacts();
    //     }
    // }, [props.record])

    const handleOk = async () => {
        setIsLoading(true);

        try {
            const currentTable = props.selectedContactsKeys.find(item => item.dispatchRequestWorkOrderId == props.record.dispatchRequestWorkOrderId);
            const sendNotificationRequest = {
                dispatchRequestWorkOrderId: props.record.dispatchRequestWorkOrderId,
                selectedContacts: currentTable.selectedKeys
            };

            await ReportsService.sendContactsNotifications(sendNotificationRequest);
            notification['success']({
                message: strings.PROJECTS.NOTIFICATIONS.CONTACTS_NOTIFIED,
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_SEND_NOTIFICATIONS);
            notification['error']({
                message: errorMessage,
            });
        }

        setIsLoading(false);
    };

    const onReportRevisionUploaded = async dispatchRequestWorkOrderId => {
        try {
            const response = await ReportsService.getByWorkOrderId(dispatchRequestWorkOrderId);
            props.setRevisionReport(dispatchRequestWorkOrderId, response.data.data);

            await props.loadReports();
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_RENEW_REPORT_DATA);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const onReportRevisionStatusUpdated = async (dispatchRequestWorkOrderId, revisionStatus) => {
        try {
            props.setLoadingState(true);

            await ReportsService.updateNotificationRevisionStatus({
                dispatchRequestWorkOrderId: dispatchRequestWorkOrderId,
                notified: revisionStatus
            });

            await props.loadReports();

            notification['success']({
                message: strings.PROJECTS.NOTIFICATIONS.NOTIFICATION_REVISION_STATUS_UPDATED
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_UPDATE_NOTIFICATION_REVISION_STATUS);
            notification['error']({
                message: errorMessage
            });
        }

        props.setLoadingState(false);
    };

    const rowSelection = {
        onSelect: (record, selected, _selectedRows) => {
            props.setSelectedContactsKeys(record.id, selected, props.record.dispatchRequestWorkOrderId);
        },
        selectedRowKeys: props.selectedContactsKeys.find(item => item.dispatchRequestWorkOrderId == props.record.dispatchRequestWorkOrderId)?.selectedKeys,
        hideSelectAll: true
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            width: "35%",
            render: (_, row) => <TextCrop icon={false} inputString={row.fullName} title="Full Name" />
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: "25%",
            render: (_, row) => <TextCrop icon={false} inputString={row.email} title="Email" />
        },
        {
            title: 'Contact Number (cell)',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
            width: "20%",
            render: (_, row) => formatPhoneNumber(row.contactNumberCell)
        },
        {
            title: 'Contact Number (office)',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
            width: "20%",
            render: (_, row) => formatPhoneNumber(row.contactNumberOffice)
        }
    ];

    return (
        <div className="reports-notification-layout">
            {/* <Table
                key="id"
                rowKey="id"
                showSorterTooltip={false}
                columns={columns}
                dataSource={props.projectContacts}
                rowSelection={{ ...rowSelection }}
                pagination={{
                    pageSize: 7,
                    total: props.projectContacts.length,
                }}
            /> */}
            <div className="contact-table-footer">
                {!!props.record && (
                    <ReportRevisionComponent
                        key="revision"
                        onUploadFinished={onReportRevisionUploaded}
                        dispatchRequestWorkOrderId={props.record.dispatchRequestWorkOrderId}
                        onReportRevisionStatusUpdated={onReportRevisionStatusUpdated}
                        notified={props.record.notified}
                        revisionedAt={props.record.revisionedAt} />
                )}
                {/* <Button className="report-notification-action-button" loading={isLoading} onClick={handleOk} type="primary" >{strings.COMMON.SUBMIT}</Button> */}
            </div>
        </div>
    )
};

const mapState = ({ reports }) => {
    return {
        projectContacts: reports.projectContacts,
        selectedContactsKeys: reports.selectedContactsKeys
    };
};

const mapDispatch = (dispatch) => {
    return {
        setNotificationReportRevision(value) {
            dispatch(actions.setNotificationReportRevision(value));
        },
        setSelectedContactsKeys(id, isSelected, dispatchRequestWorkOrderId) {
            dispatch(actions.setSelectedContacts({ id, isSelected, dispatchRequestWorkOrderId }));
        },
        setRevisionReport(id, value) {
            dispatch(actions.setRevisionReport({ id, value }));
        },
        setAllSelectedContactsKeys(dispatchRequestWorkOrderId, values) {
            dispatch(actions.setAllSelectedContacts(dispatchRequestWorkOrderId, values));
        }
    }
};

export default connect(mapState, mapDispatch)(ContactsNested);