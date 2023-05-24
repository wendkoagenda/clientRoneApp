import React, { useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import Form from '@rjsf/material-ui';
import { useParams } from 'react-router';
import { actions } from './reports-reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { connect } from 'react-redux';
import {
  ReportsService,
  TrackingService,
  UserManagement,
} from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { strings, reportTypesIds } from '../../constants';
import { populateCustomReportDataProperties } from '../../helpers/project-report-data-helper';
import { uiSchemaConcreteCore } from '../../constants/sheme-concretecore';
import { isConcreteReportType  } from '../../helpers/reportType-helper';

const NEW_BUTTON_LABEL = 'SET';
const CHANGE_SUBMIT_BUTTON_NAME = 'SAVE';

const ReportViewer = (props) => {
  const { dispatchRequestWorkOrderId, reportTypeId } = useParams();
  const inputCountsRef = useRef(0);
  const [usersOptions, setUsersOptions] = useState([]);

  const changeButtonLabel = () => {
    const addButton = document.querySelector(
      '.array-item-add .MuiButton-label'
    );
    const innerHtml = addButton.innerHTML;
    addButton.innerHTML = `${innerHtml.substring(
      0,
      innerHtml.length - 4
    )}${NEW_BUTTON_LABEL}`;
  };

  const changeSubmitButtonName = () => {
    const changeButton = document.querySelector(
      '.MuiButton-containedPrimary .MuiButton-label'
    );
    const innerHtml = changeButton.innerHTML;
    changeButton.innerHTML = innerHtml.replace(
      'Submit',
      CHANGE_SUBMIT_BUTTON_NAME
    );
  };

  const removeAddButton = () => {
    const addButton = document.querySelectorAll('.array-item-add');
    if (
      reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP ||
      reportTypeId == reportTypesIds.CONCRETE_FLOOR_FLATNESS_SURVEY ||
      reportTypeId == reportTypesIds.CONCRETE_PULVERIZATION_GRADATION
    ) {
      addButton.forEach((btn) => btn.remove());
    }
  };

  const removeAddSetButton = () => {
    if (reportTypeId == reportTypesIds.CONCRETE_REINFORCING_STEEL) {
      const addButtons = document.querySelectorAll(
        '.array-item-add > .MuiButton-label'
      );
      addButtons.forEach((btn) => {
        if (btn.textContent == ' Add SET') {
          btn.remove();
        }
      });
    }
  };

  const initialReportForm = async () => {
    try {
      const reportResponse = await ReportsService.getReportById(
        dispatchRequestWorkOrderId
      );
      props.setEditingReport(reportResponse.data.data);
    } catch (error) {
      TrackingService.trackException(error);
      const errorMessage = getErrorMessage(
        error,
        strings.COMMON.LOAD_REPORT_ERROR
      );
      notification['error']({
        message: errorMessage,
      });
    }
  };

  const createUsersDropDown = () => {
    setInterval(() => {
      const testedByInputs = document.querySelectorAll(
        '.report-layout input[id$=testedBy]'
      );

      if (testedByInputs.length != inputCountsRef.current) {
        inputCountsRef.current = testedByInputs.length;

        testedByInputs.forEach((element) => {
          element.setAttribute('list', 'users-options-tested-by');
        });
      }
    }, 3000);
  };

  const loadAllUsers = async () => {
    try {
      const usersResponse = await UserManagement.getAllUsers();
      if (usersResponse.status == 200) {
        const userNameOptions = usersResponse.data.data.map(
          (user) => user.fullName
        );
        setUsersOptions(userNameOptions);
      }
    } catch (error) {
      TrackingService.trackException(error);
      const errorMessage = getErrorMessage(
        error,
        strings.COMMON.GET_USERS_ERROR
      );
      notification['error']({
        message: errorMessage,
      });
    }
  };

  let handleFormDataChange = (e) => {
    props.setEditingReportFormData(JSON.stringify(e.formData));
    removeAddSetButton();
  };

  useEffect(() => {
    initialReportForm().then(() => {
      changeButtonLabel();
      removeAddButton();
      removeAddSetButton();
      changeSubmitButtonName();

      loadAllUsers().then(() => {
        createUsersDropDown();
      });
    });
  }, [dispatchRequestWorkOrderId]);

  const handleSubmit = async (form) => {
    try {
      props.setGlobalSpinState(true);
      await ReportsService.updateWorkOrderReport({
        dispatchRequestWorkOrderId: dispatchRequestWorkOrderId,
        jsonData: JSON.stringify(form.formData),
      });
      notification['success']({
        message: strings.COMMON.REPORT_SUBMIT_SUCCESS,
      });
      props.setGlobalSpinState(false);
    } catch (error) {
      TrackingService.trackException(error);
      props.setGlobalSpinState(false);
      const errorMessage = getErrorMessage(
        error,
        strings.COMMON.REPORT_UPDATE_ERROR
      );
      notification['error']({
        message: errorMessage,
      });
    }
  };

  return (
    <div className='report-layout'>
      {!!props.report.schema &&
        isConcreteReportType(reportTypeId) && (
          <Form
            schema={JSON.parse(props.report.schema)}
            noValidate={true}
            formData={populateCustomReportDataProperties(
              JSON.parse(props.report.jsonData)
            )}
            onSubmit={handleSubmit}
            onChange={handleFormDataChange}
            uiSchema={uiSchemaConcreteCore}
          />
        )}

      {!!props.report.schema &&
        !isConcreteReportType(reportTypeId) && (
          <Form
            schema={JSON.parse(props.report.schema)}
            noValidate={true}
            formData={populateCustomReportDataProperties(
              JSON.parse(props.report.jsonData)
            )}
            onSubmit={handleSubmit}
            onChange={handleFormDataChange}
          />
        )}
      <datalist id='users-options-tested-by'>
        {usersOptions.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
    </div>
  );
};

const mapState = ({ reports, dispatch }) => {
  return {
    report: reports.editingReport,
    managedDispatch: dispatch.managedDispatch,
  };
};

const mapDispatch = (dispatch) => {
  return {
    setPageInfo(pageName, pageKey) {
      dispatch(
        globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] })
      );
    },
    setEditingReport(report) {
      dispatch(actions.setEditingReport(report));
    },
    setGlobalSpinState(value) {
      dispatch(globalActions.setGlobalSpinState(value));
    },
    setEditingReportFormData(value) {
      dispatch(actions.setEditingReportFormData(value));
    },
  };
};

export default connect(mapState, mapDispatch)(ReportViewer);
