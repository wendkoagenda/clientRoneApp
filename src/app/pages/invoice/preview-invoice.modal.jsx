import { Button, Modal, notification } from 'antd';
import React, { useRef, useState } from 'react';
import { Document, Page } from "react-pdf";
import { strings } from '../../constants';
import { getErrorMessage } from '../../services/tracking.service';
import { useReactToPrint } from 'react-to-print';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';

const PreviewInvoiceModal = (props) => {
    const {
        previewExpanded,
        setPreviewExpanded,
        previewFile,
        invoiceGenerateResponse,
        setGlobalSpinState
    } = props;

    const [numPages, setNumPages] = useState(1);

    const invoiceRef = useRef();

    const handleInvoicePrint = (fileContent) => {
        try {
            setGlobalSpinState(true);
            document.getElementById("invoice-print-section").innerHTML = fileContent;
            handlePrint();
        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.INVOICE.ERRORS.UNABLE_TO_PRINT_INVOICE);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false)
    };

    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        onBeforePrint: () => setGlobalSpinState(false),
        onAfterPrint: () => document.getElementById("invoice-print-section").innerHTML = ''
    });

    return (
        <Modal
            title={
                <div className='invoice-print-header'>
                    {strings.INVOICE.LABELS.INVOICE_PREVIEW}
                    {
                        invoiceGenerateResponse.length > 0 && invoiceGenerateResponse.map((item, index) => {
                            return (
                                <div key={index}>
                                    <Button
                                        className='invoice-print'
                                        type='primary'
                                        onClick={() => handleInvoicePrint(item.fileContent)}>
                                        {strings.INVOICE.LABELS.PRINT} {item.fileName}
                                    </Button>
                                </div>
                            )
                        })
                    }
                </div>
            }
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
                    {Array.from(new Array(numPages - 1), (el, index) => (
                        <Page scale={1.5} key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                </Document>
            </div>
            <div style={{ position: "absolute", left: "-3999px" }}>
                <div id="invoice-print-section" ref={invoiceRef}></div>
            </div>
        </Modal >
    )
}

const mapDispatch = (dispatch) => {
    return {
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        }
    }
}

export default connect(null, mapDispatch)(PreviewInvoiceModal);