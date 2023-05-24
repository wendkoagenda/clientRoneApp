import { Button, Modal, notification } from 'antd';
import React, { useState } from 'react';
import { FilePdfOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { strings } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import InvoiceService from '../../services/invoice.service';
import { TrackingService } from "../../services";
import { connect } from 'react-redux';
import html2pdf from 'html2pdf.js/src';

const CreateInvoiceModal = (props) => {
    const [isInvoiceCreate, setIsInvoiceCreate] = useState(false);

    const {
        visible,
        onOk,
        onCancel,
        onPreview,
        invoiceModel,
        setInitialPageState,
        loadInvoiceList,
        invoiceGenerateResponse,
        divId,
        setPreviewFile,
        pdfConfig
    } = props;

    const createPdf = async (file) => {
        document.getElementById(divId).innerHTML = file.fileContent;
        var element = document.getElementById(divId);

        const outputFile = await html2pdf().set({ fileName: file.fileName, ...pdfConfig }).from(element).toPdf().get('pdf').then(pdf => {
            const totalPages = pdf.internal.getNumberOfPages();
            pdf.deletePage(totalPages);
        }).output("blob");

        console.log(outputFile)
        return {
            file: outputFile,
            fileName: file.fileName
        }
    }

    const createInvoice = async () => {
        setIsInvoiceCreate(true);
        try {
            const pdfFiles = [];
            for (let index = 0; index < invoiceGenerateResponse.length; index++) {
                pdfFiles.push(await createPdf(invoiceGenerateResponse[index]));
            }

            const uploadResponse = await InvoiceService.createInvoice(pdfFiles, invoiceModel);
            if (uploadResponse.status == 200) {
                notification['success']({
                    message: strings.INVOICE.LABELS.CREATE_INVOICE_SUCCESS,
                });
                setInitialPageState();
                await loadInvoiceList();
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.CREATE_ERROR);
            notification['error']({
                message: errorMessage,
            });
            TrackingService.trackException(error);
        }
        setIsInvoiceCreate(false);
    }

    const handleDownload = (item) => {
        document.getElementById(divId).innerHTML = item.fileContent;
        var element = document.getElementById(divId);

        html2pdf().set({ fileName: item.fileName, ...pdfConfig }).from(element).toPdf().get('pdf').then(pdf => {
            const totalPages = pdf.internal.getNumberOfPages();
            pdf.deletePage(totalPages);
        }).save();
    }

    const handleDownloadAll = () => {
        if (invoiceGenerateResponse.length > 0) {
            invoiceGenerateResponse.map((item) => {
                document.getElementById(item.fileName).innerHTML = item.fileContent;
                var element = document.getElementById(item.fileName);

                html2pdf().set({ fileName: item.fileName, ...pdfConfig }).from(element).toPdf().get('pdf').then(pdf => {
                    const totalPages = pdf.internal.getNumberOfPages();
                    pdf.deletePage(totalPages);
                }).save();
            })
        }
    }

    const handlePreview = async () => {
        document.getElementById(divId).innerHTML = invoiceGenerateResponse.map(item => item.fileContent).reduce((prev, curr) => prev + curr, '');
        var element = document.getElementById(divId);

        const outputPreviewPdf = await html2pdf().set(pdfConfig).from(element).toPdf().outputPdf();
        setPreviewFile(btoa(outputPreviewPdf));
        onPreview();
    }

    return (
        <Modal
            className="create-invoice-modal"
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            uploadModalVisible={false}
            closable={true}
            maskClosable={false}
            centered={true}
            width={600}
            footer={
                <div className="download-all">
                    {
                        [
                            <Button
                                key="download-btn"
                                onClick={() => handleDownloadAll()}
                                type="primary"
                                icon={<DownloadOutlined />}
                            >
                                {strings.INVOICE.LABELS.DOWNLOAD_ALL}
                            </Button>,
                            <div key={"invoice-btn"}>
                                <Button
                                    key="preview-btn"
                                    onClick={handlePreview}
                                    type="primary"
                                    icon={<EyeOutlined />}
                                >
                                    {strings.INVOICE.LABELS.PREVIEW}
                                </Button>,
                                <Button
                                    key="create-invoice-btn"
                                    onClick={createInvoice}
                                    type="primary"
                                    loading={isInvoiceCreate}
                                >
                                    {strings.INVOICE.LABELS.CREATE}
                                </Button>
                            </div>
                        ]
                    }
                </div>
            }
        >
            {invoiceGenerateResponse.length > 0 && invoiceGenerateResponse.map((item, index) => {
                return (
                    <div className="invoice-file-block" key={index}>
                        <div>
                            <FilePdfOutlined />
                            <h2>{item.fileName}</h2>
                        </div>
                        <Button
                            key="download-btn"
                            onClick={() => handleDownload(item)}
                            type="primary"
                            icon={<DownloadOutlined />}
                        >
                            {strings.INVOICE.LABELS.DOWNLOAD}
                        </Button>
                        <div style={{ position: "absolute", left: "-3999px" }}>
                            <div id={item.fileName}></div>
                        </div>
                    </div>
                )
            })
            }
        </Modal>
    )
}

const mapState = ({ invoice }) => {
    return {
        invoiceGenerateResponse: invoice.invoiceGenerateResponse,
        pdfConfig: invoice.pdfConfig
    };
}

export default connect(mapState, null)(CreateInvoiceModal);