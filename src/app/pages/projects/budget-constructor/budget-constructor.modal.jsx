import React, { useEffect, useRef, useState } from 'react';
import { strings } from "../../../constants";
import { connect } from 'react-redux';
import { actions } from './budget-reducer';
import { Collapse, Modal, List, Upload, notification } from 'antd';
import WorkOrderBadge from './work-order-badge.dnd';
import WorkOrderDropArea from './work-order-drop-area.dnd';
import { groupBy } from "lodash";
import { CustomBtn, CustomInput, CustomSingleOptionSelect } from '../../../components/common';
import levelsProps from '../../../constants/levels';
import { useDebouncedCallback } from 'use-debounce';
import { BudgetService } from '../../../services';
import { invoiceExtraMetricDescription } from '../../../constants/invoice-order-statuses';
import { UploadOutlined } from '@ant-design/icons';
import TrackingService, { getErrorMessage } from '../../../services/tracking.service';

const BudgetConstructor = (props) => {
    const searchInputRef = useRef('');
    const [isUploadLoading, setIsUploadLoading] = useState(false);

    const {
        isBudgetModalVisible,
        handleBudgetModalCancel,
        workOrders,
        setLevel,
        totalBudget,
        level,
        setCategory,
        category,
        searchCriteria,
        setBudgetSearchRequestCriteria,
        categoriesOptions,
        projectId,
        setBudgetItems,
        clearBudgetSetup,
        isEditMode
    } = props;

    useEffect(() => {
        if (projectId && isEditMode) {
            BudgetService.getProjectBudget(projectId).then(budgetModel => {
                const budgetItems = [];

                budgetModel.data.data.budgetItems.forEach(item => {
                    budgetItems.push({
                        budgetItemId: item.id,
                        id: item.item,
                        title: item.description,
                        category: item.section,
                        quantity: item.quantity,
                        amount: item.amount,
                        total: item.total,
                        priceLevel: item.priceLevel
                    });

                    if (item.extraMetrics && item.extraMetrics.length) {
                        item.extraMetrics.forEach(m => {
                            budgetItems.push({
                                budgetItemId: `${item.id}-${m.invoiceExtraMetricDescriptionId}`,
                                id: `${item.id}-${m.invoiceExtraMetricDescriptionId}`,
                                title: invoiceExtraMetricDescription.find(d => d.id === m.invoiceExtraMetricDescriptionId).name,
                                quantity: m.quantity,
                                amount: m.amount,
                                total: m.total,
                                workOrderId: item.item,
                                invoiceExtraMetricDescriptionId: m.invoiceExtraMetricDescriptionId
                            });
                        });
                    }
                });

                setBudgetItems(budgetItems);
            }).catch(() => {
                setBudgetItems([])
            });
        }

        return () => {
            clearBudgetSetup()
        }
    }, [projectId, setBudgetItems, clearBudgetSetup, isEditMode])

    const onSearch = useDebouncedCallback((searchString) => {
        setBudgetSearchRequestCriteria(searchString);
    }, 400);

    const renderWorkOrderBadge = (item) => {
        return (
            <WorkOrderBadge
                item={item}
                isSelected={props.assignedWorkOrders.some(wo => wo.id == item.workOrder.id)}
            />
        );
    };

    const renderWorkOrders = () => {
        const ordersGroupedByCategory = groupBy(workOrders, item => item.workOrder.category);
        return (
            <Collapse>
                {
                    Object.keys(ordersGroupedByCategory)?.map((key) => {
                        return (
                            <Collapse.Panel header={key} key={key}>
                                <List
                                    key="id"
                                    className="employees-list"
                                    size="small"
                                    dataSource={ordersGroupedByCategory[key]}
                                    renderItem={renderWorkOrderBadge}
                                />
                            </Collapse.Panel>
                        )
                    })
                }
            </Collapse>
        );
    };

    const uploadProjectBudget = async ({ file }) => {
        try {
            setIsUploadLoading(true);
            const uploadResponse = await BudgetService.uploadProjectBudget(projectId, file);
            if (uploadResponse.status == 200) {
                BudgetService.getProjectBudget(projectId).then(budgetModel => {
                    const budgetItems = [];

                    budgetModel.data.data.budgetItems.forEach(item => {
                        budgetItems.push({
                            budgetItemId: item.id,
                            id: item.item,
                            title: item.description,
                            category: item.section,
                            quantity: item.quantity,
                            amount: item.amount,
                            total: item.total,
                            priceLevel: item.priceLevel
                        });

                        if (item.extraMetrics && item.extraMetrics.length) {
                            item.extraMetrics.forEach(m => {
                                budgetItems.push({
                                    budgetItemId: `${item.id}-${m.invoiceExtraMetricDescriptionId}`,
                                    id: `${item.id}-${m.invoiceExtraMetricDescriptionId}`,
                                    title: invoiceExtraMetricDescription.find(d => d.id === m.invoiceExtraMetricDescriptionId).name,
                                    quantity: m.quantity,
                                    amount: m.amount,
                                    total: m.total,
                                    workOrderId: item.item,
                                    invoiceExtraMetricDescriptionId: m.invoiceExtraMetricDescriptionId
                                });
                            });
                        }
                    });

                    setBudgetItems(budgetItems);
                }).catch(() => {
                    setBudgetItems([])
                });
                notification['success']({
                    message: `${strings.PROJECTS.NOTIFICATIONS.PROJECT_BUDGET_UPLOADED} ${uploadResponse.data.data}`,
                });
            }

        } catch (error) {
            const errorMessage = getErrorMessage(error, strings.PROJECTS.NOTIFICATIONS.UNABLE_TO_UPLOAD_PROJECT_BUDGET);
            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        setIsUploadLoading(false);
    };

    return (
        <Modal
            title={
                <div className="upload-budget">
                    {strings.COMMON.BUDGET_CONSTRUCTOR}
                    <Upload
                        accept="text/csv"
                        className="revision-upload"
                        showUploadList={false}
                        customRequest={uploadProjectBudget}>
                        <CustomBtn type={"primary"} name={strings.COMMON.UPLOAD} loading={isUploadLoading} icon={<UploadOutlined />} />
                    </Upload>
                </div>
            }
            visible={isBudgetModalVisible}
            onCancel={handleBudgetModalCancel}
            width="90vw"
            wrapClassName="budget-constructor"
            footer={[]}
            destroyOnClose={true}
        >
            <div className="budget-header">
                <CustomSingleOptionSelect
                    placeholder={strings.COMMON.LEVEL}
                    options={levelsProps}
                    value={level}
                    handleChange={setLevel}
                />
                <div className="submit-budget">
                    <p>{`Total Budget: $${totalBudget}`}</p>
                </div>
            </div>
            <div className="table-wrapper">
                <div className="work-order-list" style={{ overflowY: !level ? 'hidden' : 'scroll' }}>
                    <div className="filter-block-wrapper">
                        <CustomInput
                            defaultValue={searchCriteria}
                            inputRef={searchInputRef}
                            placeHolder={strings.COMMON.SEARCH}
                            onInputChange={e => onSearch(e.target.value)}
                        />
                        <CustomSingleOptionSelect
                            placeholder={strings.COMMON.CATEGORY}
                            options={categoriesOptions}
                            value={category}
                            handleChange={setCategory}
                        />
                    </div>
                    {renderWorkOrders()}
                    {!level && (
                        <div className="disable-work-order-list" />
                    )}
                </div>
                <WorkOrderDropArea />
            </div>
        </Modal>
    )
}

const mapState = ({ budget, projects }) => {
    return {
        level: budget.level,
        workOrders: budget.workOrders,
        totalBudget: budget.totalBudget,
        category: budget.budgetSearchRequest.category,
        assignedWorkOrders: budget.assignedWorkOrders,
        searchCriteria: budget.budgetSearchRequest.searchCriteria,
        categoriesOptions: budget.categoriesOptions,
        isEditMode: projects.editingStatus
    };
}

const mapDispatch = (dispatch) => {
    return {
        setLevel(value) {
            dispatch(actions.setLevel(value));
        },
        setCategory(value) {
            dispatch(actions.setCategory(value));
        },
        setBudgetSearchRequestCriteria(value) {
            dispatch(actions.setBudgetSearchRequestCriteria(value));
        },
        setBudgetItems(value) {
            dispatch(actions.setBudgetItems(value));
        },
        clearBudgetSetup() {
            dispatch(actions.clearBudgetSetup());
        }
    }
}

export default connect(mapState, mapDispatch)(BudgetConstructor);