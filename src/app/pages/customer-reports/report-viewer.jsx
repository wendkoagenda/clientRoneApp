import React, { useEffect } from 'react';
import { notification } from 'antd';
import Form from "@rjsf/material-ui";
import { useParams } from 'react-router';
import { actions } from '../reports/reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import { CustomerPortalService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { strings } from '../../constants';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';

const CustomerReportViewer = (props) => {
    const { dispatchRequestWorkOrderId } = useParams();

    const RemoveButtons = _ => {
        const buttons = document.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].remove()
        }

        const addRemoveButtons = document.querySelectorAll('.MuiButtonBase-root');
        for (let i = 0; i < addRemoveButtons.length; i++) {
            addRemoveButtons[i].remove()
        }
    }

    const transformInputs = _ => {
        const inputs = document.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].setAttribute('disabled', '')
        }
    }

    const initialReportForm = async () => {
        try {
            const reportResponse = await CustomerPortalService.getReportById(dispatchRequestWorkOrderId);
            props.setEditingReport(reportResponse.data.data);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.LOAD_REPORT_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    useEffect(() => {
        initialReportForm().then(() => {
            RemoveButtons();
            transformInputs();
        });
    }, [dispatchRequestWorkOrderId]);

    return (
        <div className="report-layout">
            {!!props.report.schema &&
                <Form
                    schema={JSON.parse(props.report.schema)}
                    noValidate={true}
                    formData={populateCustomReportDataProperties(JSON.parse(props.report.jsonData))}
                />
            }
        </div>
    )
}

const mapState = ({ reports }) => {
    return {
        report: reports.editingReport
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setEditingReport(report) {
            dispatch(actions.setEditingReport(report));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
    }
}

export default connect(mapState, mapDispatch)(CustomerReportViewer);