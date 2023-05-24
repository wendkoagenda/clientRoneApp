import React from "react";
import { useDrop } from "react-dnd";
import { connect } from "react-redux";
import { actions } from './budget-reducer';
import { Table, Popconfirm, Button, Popover } from "antd";
import {
    PlusOutlined,
    VerticalAlignBottomOutlined,
    UpSquareOutlined
} from "@ant-design/icons";
import { TextCropCell } from "../../../components/common";
import { EditableCell, EditableRow } from "./editable-row.table";
import { strings } from "../../../constants";
import { CSSTransition } from "react-transition-group";
import { invoiceExtraMetricDescription } from "../../../constants/invoice-order-statuses";

const WorkOrderDropArea = (props) => {

    const {
        assignedWorkOrders,
        assignWorkOrder,
        saveNewData,
        removeAssignedOrder,
        addExtraMetric
    } = props;

    const MetricSelector = ({ budgetItem }) => {
        const selectedMetrics = assignedWorkOrders.filter(item => item.workOrderId == budgetItem.id);
        const options = invoiceExtraMetricDescription.filter(item => !selectedMetrics.some(x => x.invoiceExtraMetricDescriptionId == item.id));

        return (
            <div>
                {
                    options.map(item => {
                        return (
                            <Button key={item.id} onClick={() => addExtraMetric(budgetItem.id, item.id)} block>{item.name}</Button>
                        )
                    })
                }
            </div>
        );
    };

    const columns = [
        {
            title: 'Section',
            dataIndex: 'category',
            key: 'category',
            width: '12%',
            render: (_, row) => {
                return (
                    <TextCropCell inputString={row.category} title="Section" />
                );
            }
        },
        {
            title: 'Item',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            render: (_, row) => {
                return !row.workOrderId ? `${row.id}` : ""
            }
        },
        {
            title: 'Description',
            dataIndex: 'title',
            key: 'title',
            width: '28%',
            render: (_, row) => {
                return (
                    <TextCropCell inputString={row.title} title="Description" />
                );
            }
        },
        {
            title: 'Level',
            dataIndex: 'priceLevel',
            key: 'priceLevel',
            width: '4%',
            render: (_, row) => row.priceLevel
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            editable: true,
            width: '12%',
            render: (_, row) => {
                return `${row.quantity}`;
            }
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            editable: true,
            width: '12%',
            render: (_, row) => {
                return `$ ${row.amount}`;
            }
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: '14%',
            render: (_, row) => {
                return `$ ${row.total}`;
            }
        },
        {
            title: '',
            dataIndex: 'metrics',
            key: 'metrics',
            width: '2%',
            render: (_, row) => {
                return (
                    !row.workOrderId && (
                        <Popover
                            title={false}
                            trigger="click"
                            overlayStyle={{
                                "maxWidth": "14%"
                            }}
                            content={<MetricSelector budgetItem={row} />}
                        >
                            <UpSquareOutlined className="extra-metric-budget-button" />
                        </Popover>
                    )

                )
            }
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            width: '4%',
            render: (_cell, row) => {
                return (
                    <Popconfirm title={strings.COMMON.REMOVE_BUDGET_ORDER} onConfirm={() => removeAssignedOrder(row.id)}>
                        <Button className="delete-btn" icon={<PlusOutlined style={{ transform: 'rotate(45deg)' }} />} />
                    </Popconfirm>
                )
            }
        }
    ];

    const [collectedProps, drop] = useDrop(
        () => ({
            accept: "workOrder",
            drop: (item, _monitor) => assignWorkOrder(item.workOrder),
            collect: monitor => ({
                isActive: monitor.canDrop() && monitor.isOver(),
                isDragging: monitor.getItem()
            })
        }),
        [assignedWorkOrders]
    );

    const handleEditSave = (row) => {
        const updatedData = [...assignedWorkOrders];
        const index = updatedData.findIndex((item) => row.id === item.id);
        const item = updatedData[index];
        updatedData.splice(index, 1, {
            ...item,
            ...row
        });
        saveNewData(updatedData);
    }

    const columnsWithEditCells = columns.map(col => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: handleEditSave,
            })
        }
    })

    return (
        <div ref={drop} className="budget-drop-area">
            <Table
                rowClassName="budget-row"
                key="id"
                rowKey="id"
                showSorterTooltip={false}
                dataSource={assignedWorkOrders}
                pagination={{ pageSize: 6 }}
                columns={columnsWithEditCells}
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell,
                    },
                }}
            />
            <CSSTransition
                in={collectedProps.isDragging}
                timeout={350}
                classNames="on-drop"
                unmountOnExit
            >
                <div className="on-drop-block">
                    <VerticalAlignBottomOutlined style={{ fontSize: '55px' }} />
                </div>
            </CSSTransition>
        </div>
    );
};

const mapState = ({ budget }) => {
    return {
        level: budget.level,
        assignedWorkOrders: budget.assignedWorkOrders,
        workOrders: budget.workOrders
    };
};

const mapDispatch = (dispatch) => {
    return {
        assignWorkOrder(value) {
            dispatch(actions.assignWorkOrder(value));
        },
        saveNewData(values) {
            dispatch(actions.saveNewData(values));
        },
        removeAssignedOrder(id) {
            dispatch(actions.removeAssignedOrder(id));
        },
        addExtraMetric(id, invoiceExtraMetricDescriptionId) {
            dispatch(actions.addExtraMetric({
                id,
                invoiceExtraMetricDescriptionId
            }))
        }
    }
}

export default connect(mapState, mapDispatch)(WorkOrderDropArea);
