import React, { useEffect, useState } from 'react';
import { Popover, notification, Table, Button, Modal } from 'antd';
import { strings } from '../../constants';
import { ReportsService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { actions } from './reports-reducer';
import { connect } from 'react-redux';
import TextCrop from '../../components/common/text-crop';
import { Document, Page, pdfjs } from "react-pdf";
import moment from 'moment';
import {
    EyeOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import { downloadFileFromFileResponse } from '../../helpers/file-download-helper';
import { DEFAULT_UTC_OFFSET } from '../../helpers/timeline-helper';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReportRevisionHistoryPopover = (props) => {
    const { dispatchRequestWorkOrderId } = props;

    const [previewFile, setPreviewFile] = useState(null);
    const [isHistoryPreviewLoading, setIsHistoryPreviewLoading] = useState(false);
    const [isHistoryDownloadLoading, setIsHistoryDownloadLoading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [previewExpanded, setPreviewExpanded] = useState(false);

    const loadReportRevisionHistory = async () => {
        try {
            const ReportRevisionHistoryResponse = await ReportsService.loadReportRevisionHistory(dispatchRequestWorkOrderId);
            props.setReportsRevisionHistory(dispatchRequestWorkOrderId, ReportRevisionHistoryResponse.data.data);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_LOAD_REPORT_HISTORY);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
    }

    const onPreview = async (id) => {
        setIsHistoryPreviewLoading({
            id: id,
            state: true
        });
        try {
            const responseFile = await ReportsService.downloadReportRevisionHistoryById(id);
            setPreviewFile(responseFile.data.data.fileBytes);
            setPreviewExpanded(true);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_LOAD_PREVIEW);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
        setIsHistoryPreviewLoading({
            id: id,
            state: false
        });
    };

    const onDownload = async (id) => {
        setIsHistoryDownloadLoading({
            id: id,
            state: true
        });
        try {
            const fileResponse = await ReportsService.downloadReportRevisionHistoryById(id);

            downloadFileFromFileResponse("application/pdf", fileResponse);
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_DOWNLOAD_REPORT);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }
        setIsHistoryDownloadLoading({
            id: id,
            state: false
        });
    };

    useEffect(() => {
        (async () => {
            if (dispatchRequestWorkOrderId) {
                loadReportRevisionHistory();
            }
        })();
    }, [dispatchRequestWorkOrderId, props.notificationReportRevision])

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createAt',
            key: 'createAt',
            width: "35%",
            render: (_, row) => <TextCrop icon={false} inputString={moment(row.createAt).utcOffset(DEFAULT_UTC_OFFSET).format('MMMM Do YYYY, h:mm:ss a')} title="Date" />
        },
        {
            title: 'Manager Name',
            dataIndex: 'managerFullName',
            key: 'managerFullName',
            width: "35%",
            render: (_, row) => <TextCrop icon={false} inputString={row.managerFullName} title="Manager Name" />
        },
        {
            key: 'action',
            width: '30%',
            render: (_, record) => {
                return (
                    <div className="report-history-table-actions">
                        <Button
                            className={`report-notification-action-button`}
                            loading={isHistoryPreviewLoading.id == record.id && isHistoryPreviewLoading.state}
                            type="primary"
                            onClick={() => onPreview(record.id)}
                            icon={<EyeOutlined />}>
                            Preview
                        </Button>
                        <Button
                            className={`report-notification-action-button`}
                            loading={isHistoryDownloadLoading.id == record.id && isHistoryDownloadLoading.state}
                            onClick={() => onDownload(record.id)}
                            type="primary"
                            icon={<DownloadOutlined />}>
                            Download
                        </Button>
                    </div>
                )
            },
        }
    ];

    const reportHistoryContent = (
        <>
            <Table
                key="id"
                rowKey="id"
                showSorterTooltip={false}
                columns={columns}
                dataSource={props.reportsRevisionHistory.find(item => item.dispatchRequestWorkOrderId == dispatchRequestWorkOrderId)?.history}
                pagination={{
                    pageSize: 200,
                    total: props.reportsRevisionHistory.find(item => item.dispatchRequestWorkOrderId == dispatchRequestWorkOrderId)?.history?.length,
                }}
            />
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
    )

    return (
        <Popover title={strings.PROJECTS.REVISION_HISTORY} trigger="click" content={reportHistoryContent} overlayClassName="report-revision-popover">
            {props.children}
        </Popover>
    )
}

const mapState = ({ reports }) => {
    return {
        notificationReportRevision: reports.notificationReportRevision,
        reportsRevisionHistory: reports.reportsRevisionHistory
    };
};

const mapDispatch = (dispatch) => {
    return {
        setReportsRevisionHistory(id, value) {
            dispatch(actions.setReportsRevisionHistory(id, value));
        }
    }
};

export default connect(mapState, mapDispatch)(ReportRevisionHistoryPopover);