import React, { useCallback, useEffect, useState } from 'react';
import {
    notification,
    Popconfirm,
    Modal,
    Tree,
    Spin
} from 'antd';
import { actions } from './projects-reducer'
import { CustomBtn } from '../../components/common';
import { strings } from '../../constants';
import { connect } from 'react-redux';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { ProjectsService } from '../../services';

const ReportsDistribution = (props) => {
    const {
        isReportsDistributionModalVisible,
        setReportsDistributionModalState,
        contactId,
        projectId
    } = props;

    const [treeDataLoading, setTreeDataLoading] = useState(false);
    const [submitRequestLoading, setSubmitRequestLoading] = useState(false);
    const [reportDistributionState, setReportDistributionState] = useState({
        workOrdersData: [],
        checkedKeys: []
    });

    const onSubmit = async () => {
        try {
            setSubmitRequestLoading(true);
            const selectedIds = reportDistributionState.checkedKeys.filter(item => typeof item == 'number');
            await ProjectsService.addProjectContact({
                projectId: projectId,
                contactId: contactId
            })

            const upsertResponse = await ProjectsService.upsertProjectContactReportDistribution({
                projectId: projectId,
                contactId: contactId,
                workOrdersIds: selectedIds
            });

            if (upsertResponse.status == 200) {
                notification['success']({
                    message: strings.PROJECTS.REPORTS_DISTRIBUTION_UPSERT_SUCCESS
                });
            }

            setSubmitRequestLoading(false);
            setReportsDistributionModalState(false);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.REPORTS_DISTRIBUTION_UPSERT_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const getReportDistribution = useCallback(async () => {
        try {
            const response = await ProjectsService.getProjectContactReportDistribution({
                projectId: projectId,
                contactId: contactId
            });

            const checkedIds = [];
            const mappedResponse = response.data.data.map(item => {
                return {
                    key: item.section,
                    title: item.section,
                    children: item.workOrders.map(w => {
                        if (w.isSelected) {
                            checkedIds.push(w.id);
                        }

                        return {
                            key: w.id,
                            title: w.title
                        }
                    })
                };
            });

            setReportDistributionState({
                checkedKeys: checkedIds,
                workOrdersData: mappedResponse
            });
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [contactId, projectId]);

    useEffect(() => {
        if (contactId != strings.NEW_RECORD_ID_VALUE && projectId != strings.NEW_RECORD_ID_VALUE) {
            setTreeDataLoading(true);
            getReportDistribution().then(() => {
                setTreeDataLoading(false);
            })
        }
    }, [contactId, getReportDistribution, projectId])

    const onCheck = (checkedKeysValue) => {
        console.log('onCheck', checkedKeysValue);
        setReportDistributionState(prev => {
            return {
                ...prev,
                checkedKeys: checkedKeysValue
            }
        })
    };

    return (
        <Modal
            className='project-contact-report-distribution-modal'
            title={strings.COMMON.REPORTS_DISTRIBUTION}
            visible={isReportsDistributionModalVisible}
            destroyOnClose={true}
            onCancel={() => setReportsDistributionModalState(false)}
            width="30vw"
            bodyStyle={{ height: 500, overflowY: 'scroll', overflowX: 'hidden' }}
            footer={[
                <Popconfirm
                    key="save-changes"
                    placement="right"
                    title={strings.COMMON.SAVE_CHANGES_CONFIRM}
                    onConfirm={onSubmit}
                    okText={strings.COMMON.OK}
                    cancelText={strings.COMMON.CANCEL}
                >
                    <CustomBtn
                        type="primary"
                        isLoading={submitRequestLoading}
                        name={strings.COMMON.SAVE_CHANGES} />
                </Popconfirm>
            ]}
        >
            {
                treeDataLoading ? (
                    <Spin className='tree-data-loader' />
                ) : (
                    <Tree
                        checkable
                        onCheck={onCheck}
                        checkedKeys={reportDistributionState.checkedKeys}
                        treeData={reportDistributionState.workOrdersData} />
                )
            }
        </Modal>
    )
}

const mapState = ({ projects }) => {
    return {
        isReportsDistributionModalVisible: projects.isReportsDistributionModalVisible,
        contactId: projects.reportDistributionContactId,
        projectId: projects.editProjectId
    };
}

const mapDispatch = (dispatch) => {
    return {
        setReportsDistributionModalState(value) {
            dispatch(actions.setReportsDistributionModalState(value));
        }
    }
}

export default connect(mapState, mapDispatch)(ReportsDistribution);