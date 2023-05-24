import { Button, notification, Upload, Typography, Modal, Tooltip, Switch, Popconfirm } from 'antd';
import React, { useState } from 'react';
import { strings } from '../../constants';
import {
    CloudUploadOutlined,
    EyeOutlined,
    DownloadOutlined,
    ReadOutlined
} from "@ant-design/icons";
import { ReportsService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { Document, Page, pdfjs } from "react-pdf";
import { downloadFileFromFileResponse } from '../../helpers/file-download-helper';
import ReportRevisionHistoryPopover from './revision-history.component';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const { Text } = Typography;


const ReportRevisionComponent = ({
    dispatchRequestWorkOrderId,
    revisionedAt,
    onUploadFinished,
    onReportRevisionStatusUpdated,
    notified
}) => {

    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isDownloadLoading, setIsDownloadLoading] = useState(false);

    const uploadReport = async ({ file }) => {
        try {
            setIsUploadLoading(true);
            const uploadResponse = await ReportsService.uploadNotificationRevision(dispatchRequestWorkOrderId, file);
            if (uploadResponse.status == 200) {
                notification['success']({
                    message: strings.PROJECTS.NOTIFICATIONS.REPORT_UPLOADED,
                });
            }

            await onUploadFinished(dispatchRequestWorkOrderId);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_UPLOAD_REPORT);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        setIsUploadLoading(false);
    };

    const onPreview = async () => {
        setIsPreviewLoading(true);
        try {
            const responseFile = await ReportsService.downloadNotificationRevision(dispatchRequestWorkOrderId);
            setPreviewFile(responseFile.data.data.fileBytes);
            setPreviewExpanded(true);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_LOAD_PREVIEW);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        setIsPreviewLoading(false);
    };

    const onDownload = async () => {
        try {
            setIsDownloadLoading(true);

            const fileResponse = await ReportsService.downloadNotificationRevision(dispatchRequestWorkOrderId);

            downloadFileFromFileResponse("application/pdf", fileResponse);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_DOWNLOAD_REPORT);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        setIsDownloadLoading(false);
    };

    return (
        <>
            <div key="revision" className="revision-info">
                <Text strong>{strings.PROJECTS.REVISION_LABEL}</Text>
                {
                    revisionedAt ? (
                        <span>{revisionedAt.toUTCKind().convertToEST(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT_WITH_TIME)}</span>
                    ) : (
                        <span>{strings.PROJECTS.NO_REVISION}</span>
                    )
                }
                <Upload
                    accept="application/pdf"
                    className="revision-upload"
                    showUploadList={false}
                    customRequest={uploadReport}
                >
                    <Button loading={isUploadLoading} icon={<CloudUploadOutlined />}>Upload new revision</Button>
                </Upload>
                <Button
                    disabled={!revisionedAt}
                    className={`report-notification-action-button ${!revisionedAt && "report-notification-action-button-disable"}`}
                    loading={isPreviewLoading}
                    onClick={onPreview}
                    type="primary"
                    icon={<EyeOutlined />}>
                    Preview
                </Button>
                <Button
                    disabled={!revisionedAt}
                    className={`report-notification-action-button ${!revisionedAt && "report-notification-action-button-disable"}`}
                    loading={isDownloadLoading}
                    onClick={onDownload}
                    type="primary"
                    icon={<DownloadOutlined />}>
                    Download
                </Button>
                <div className="revision-history-btn">
                    <ReportRevisionHistoryPopover dispatchRequestWorkOrderId={dispatchRequestWorkOrderId}>
                        <Tooltip title={strings.PROJECTS.VIEW_HISTORY}>
                            <ReadOutlined />
                        </Tooltip>
                    </ReportRevisionHistoryPopover>
                </div>
                <Popconfirm
                    title={strings.COMMON.CHANGE_REVISION_STATUS_CONFIRM}
                    onConfirm={() => onReportRevisionStatusUpdated(dispatchRequestWorkOrderId, !notified)}>
                    <div className="revision-status">
                        <Switch
                            checked={!notified}
                            checkedChildren={'Pending'}
                            unCheckedChildren={'Notified'} />
                    </div>
                </Popconfirm>
            </div>
            <Modal
                title="Report Preview"
                visible={previewExpanded}
                onOk={() => { }}
                onCancel={() => setPreviewExpanded(false)}
                width={1000}
                destroyOnClose={true}
                className="pdf-preview-modal"
                footer={false}
            >
                <div className="all-page-container">
                    <Document
                        file={`data:application/pdf;base64,${previewFile}`}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <Page scale={1.5} key={`page_${index + 1}`} pageNumber={index + 1} />
                        ))}
                    </Document>
                </div>
            </Modal>
        </>
    );
};

export default ReportRevisionComponent;