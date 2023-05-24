import React, { useCallback, useEffect, useRef, useState } from 'react';
import { notification, Table, Form, Popconfirm, BackTop } from 'antd';
import { connect } from 'react-redux';
import { actions } from './budget-sheet.reducer';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { BudgetService, DispatchService, TrackingService } from '../../services';
import { getErrorMessage } from '../../services/tracking.service';
import { strings } from '../../constants';
import { CustomBtn, TextCropCell } from '../../components/common';
import { CustomInput, CustomSingleOptionSelect } from '../../components/common';
import { useDebouncedCallback } from 'use-debounce';
import {
    PlusOutlined,
    CheckOutlined,
    EditOutlined,
    EnvironmentOutlined,
    UpOutlined,
    DownOutlined
} from "@ant-design/icons";
import { EditableCell } from './editable-row';
import CreateWorkOrderModal from './create-work-order.modal';
import AdminTimeRow from './admin-time-row.expanded';

const BudgetSheetTable = (props) => {
    const searchInputRef = useRef('');

    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState('');
    const [workOrderModalVisible, setWorkOrderModalVisible] = useState(false);

    const {
        setWorkOrders,
        budgetSearchRequest,
        workOrders,
        setPageInfo,
        setGlobalSpinState,
        searchCriteria,
        categoriesOptions,
        category,
        setCategory,
        setBudgetSearchRequestCriteria,
        setCategoriesOptions,
        updateEditedRow
    } = props;

    const isEditing = (record) => record.workOrderId === editingId;

    const editRecord = (record) => {
        form.setFieldsValue({
            level1: '',
            level2: '',
            level3: '',
            level4: '',
            level5: '',
            level6: '',
            ...record,
        });
        setEditingId(record.workOrderId);
    };

    const renderLevelColumn = (row, level) => {
        const obj = {
            children: level === undefined ? 'n/a' : level,
            props: {
                style: { display: row.isPricingItem ? 'none' : '' }
            }
        };

        return obj;
    }

    const nullCheckForLevel = (level) => level != '' ? Number(level) : null;

    const saveRecordChanges = async (id, isPricingItem) => {
        try {
            const editedRow = await form.validateFields();
            const budgetSheetEditResponse = await BudgetService.upsertBudgetSheetRecord({
                workOrderId: id,
                level1: nullCheckForLevel(editedRow.level1),
                level2: nullCheckForLevel(editedRow.level2),
                level3: nullCheckForLevel(editedRow.level3),
                level4: nullCheckForLevel(editedRow.level4),
                level5: nullCheckForLevel(editedRow.level5),
                level6: nullCheckForLevel(editedRow.level6),
                isPricingItem
            });

            updateEditedRow(budgetSheetEditResponse.data.data);
            notification['success']({
                message: strings.COMMON.BUDGET_SHEET_EDIT_SUCCESS,
            });

        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_BUDGET_SHEET_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setEditingId(null);
    };

    const loadWorkOrders = useCallback(async () => {
        try {
            const workOrdersResponse = await DispatchService.getAllWorkOrder();

            setCategoriesOptions([{
                key: strings.COMMON.ALL_CATEGORIES,
                value: strings.COMMON.ALL_CATEGORIES
            }, ...Object.keys(workOrdersResponse.data.data).map(item => {
                return {
                    key: item,
                    value: item
                }
            })]);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [setCategoriesOptions])

    const loadBudgetSheet = useCallback(async () => {
        try {
            const ordersResponse = await BudgetService.searchPricingSheetOrders(budgetSearchRequest);

            setWorkOrders(ordersResponse.data.data);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [budgetSearchRequest, setWorkOrders])

    const onWorkOrderCreated = async () => {
        setGlobalSpinState(true);
        await loadBudgetSheet();
        setGlobalSpinState(false);
    }

    const onSearch = useDebouncedCallback((searchString) => {
        setBudgetSearchRequestCriteria(searchString);
    }, 400);

    useEffect(() => {
        setGlobalSpinState(true);
        loadBudgetSheet().then(() => {
            setGlobalSpinState(false);
        });
    }, [loadBudgetSheet, budgetSearchRequest, setGlobalSpinState])

    useEffect(() => {
        setPageInfo(strings.PAGES.BUDGET_SHEET, null);
        loadWorkOrders();
    }, [loadWorkOrders, setPageInfo])

    const columns = [
        {
            title: 'Item',
            dataIndex: 'workOrderId',
            key: 'workOrderId',
            width: '10%',
        },
        {
            title: 'Section',
            dataIndex: ['workOrder', 'category'],
            key: 'workOrder.category',
            width: '12%',
        },
        {
            title: 'Description',
            dataIndex: 'workOrder.title',
            key: 'workOrder.title',
            width: '24%',
            render: (_, row) => {
                return (
                    <TextCropCell inputString={row.workOrder.title} title="Description" />
                );
            }
        },
        {
            title: 'Level 1',
            dataIndex: 'level1',
            editable: true,
            key: 'level1',
            width: '8%',
            render: (_value, row, _index) => {
                const obj = {
                    children: row.level1 === undefined ? 'n/a' : row.level1,
                    props: {
                        colSpan: row.isPricingItem ? 6 : 1
                    }
                };

                return obj;
            }
        },
        {
            title: 'Level 2',
            dataIndex: 'level2',
            key: 'level2',
            editable: true,
            width: '8%',
            render: (_, record) => {
                return renderLevelColumn(record, record.level2)
            }
        },
        {
            title: 'Level 3',
            dataIndex: 'level3',
            key: 'level3',
            editable: true,
            width: '8%',
            render: (_, record) => {
                return renderLevelColumn(record, record.level3)
            }
        },
        {
            title: 'Level 4',
            dataIndex: 'level4',
            key: 'level4',
            editable: true,
            width: '8%',
            render: (_, record) => {
                return renderLevelColumn(record, record.level4)
            }
        },
        {
            title: 'Level 5',
            dataIndex: 'level5',
            key: 'level5',
            editable: true,
            width: '8%',
            render: (_, record) => {
                return renderLevelColumn(record, record.level5)
            }
        },
        {
            title: 'Level 6',
            dataIndex: 'level6',
            key: 'level6',
            editable: true,
            width: '8%',
            render: (_, record) => {
                return renderLevelColumn(record, record.level6)
            }
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            width: '6%',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <div className="edit-actions">
                        <Popconfirm title={strings.COMMON.SAVE_CHANGES} onConfirm={() => saveRecordChanges(record.workOrderId, record.isPricingItem)}>
                            <CheckOutlined />
                        </Popconfirm>
                        <PlusOutlined onClick={() => setEditingId(null)} />
                    </div>
                ) : (
                    <EditOutlined style={{ marginLeft: '25%' }} onClick={_ => editRecord(record)} />
                )
            }
        }
    ];

    const editableColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <div className="client-list-layout">
            <div className="budget-sheet-list">
                <div className="filter-block">
                    <CustomSingleOptionSelect
                        placeholder={strings.COMMON.CATEGORY}
                        options={categoriesOptions}
                        value={category}
                        handleChange={setCategory}
                    />
                    <CustomInput
                        defaultValue={searchCriteria}
                        inputRef={searchInputRef}
                        placeHolder={strings.COMMON.SEARCH}
                        onInputChange={e => onSearch(e.target.value)}
                    />
                    <div className="action-group">
                        <CustomBtn
                            icon={<EnvironmentOutlined />}
                            type="Default"
                            onClick={() => setWorkOrderModalVisible(true)}
                            name={strings.WORK_ORDERS_MANAGEMENT.LABELS.ADD_NEW_WORK_ORDER} />
                    </div>
                </div>
                <Form form={form} component={false}>
                    <Table
                        bordered
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        key="workOrderId"
                        rowKey="workOrderId"
                        rowClassName={'budget-row'}
                        showSorterTooltip={false}
                        dataSource={workOrders}
                        columns={editableColumns}
                        expandable={{
                            expandedRowRender: (record) => (
                                <AdminTimeRow record={record} />
                            ),
                            expandIcon: ({ expanded, onExpand, record }) =>
                                expanded ? (
                                    <UpOutlined onClick={e => onExpand(record, e)} />
                                ) : (
                                    <DownOutlined onClick={e => onExpand(record, e)} />
                                )
                        }}
                        pagination={{
                            pageSize: 200,
                            pageSizeOptions: [9, 15, 100, 150, 200],
                            showSizeChanger: true
                        }}
                    />
                    <BackTop />
                </Form>
            </div>
            <CreateWorkOrderModal
                onCancel={() => setWorkOrderModalVisible(false)}
                onWorkOrderCreated={onWorkOrderCreated}
                workOrderModalVisible={workOrderModalVisible} />
        </div>
    )
}

const mapState = ({ budgetSheet }) => {
    return {
        workOrders: budgetSheet.workOrders,
        category: budgetSheet.budgetSearchRequest.category,
        searchCriteria: budgetSheet.budgetSearchRequest.searchCriteria,
        categoriesOptions: budgetSheet.categoriesOptions,
        budgetSearchRequest: budgetSheet.budgetSearchRequest
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setWorkOrders(values) {
            dispatch(actions.setWorkOrders(values));
        },
        setCategory(value) {
            dispatch(actions.setCategory(value));
        },
        setBudgetSearchRequestCriteria(value) {
            dispatch(actions.setBudgetSearchRequestCriteria(value));
        },
        setCategoriesOptions(values) {
            dispatch(actions.setCategoriesOptions(values));
        },
        updateEditedRow(values) {
            dispatch(actions.updateEditedRow(values));
        }
    }
}

export default connect(mapState, mapDispatch)(BudgetSheetTable);