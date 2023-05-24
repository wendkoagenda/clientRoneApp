import React, { useCallback, useEffect } from 'react';
import { Table, Collapse, Typography, notification, DatePicker, Empty } from 'antd';
import { actions as globalActions } from '../../../store/reducers/authorized-layout.reducer';
import { actions } from './budget-comparison.reducer';
import { connect } from 'react-redux'
import { pageNumbers, strings } from '../../../constants';
import { TextCropCell } from '../../../components/common';
import { useParams } from 'react-router';
import { ProjectsService, TrackingService } from '../../../services';
import { getErrorMessage } from '../../../services/tracking.service';
import { CustomBtn } from '../../../components/common/';
import {
    ExportOutlined
} from '@ant-design/icons';
import FileSaver from 'file-saver';
import moment from 'moment';

const { Panel } = Collapse;
const { Text } = Typography;

const tableStyle = {
    fontSize: '16px'
}

const BudgetComparisonTable = (props) => {

    const {
        setPageInfo,
        budgetComparisonSearchRequest,
        setGlobalSpinState,
        setBudgetComparisonModel,
        setProjectId,
        budgetComparison,
        setBudgetComparisonRequestDateRange,
        setInitialBudgetComparisonRequest
    } = props;

    const { projectId } = useParams();

    useEffect(() => {
        setPageInfo(strings.PAGES.BUDGET_COMPARISON, pageNumbers.BUDGET_COMPARISON);
        setProjectId(projectId)

        return () => {
            setInitialBudgetComparisonRequest()
        }
    }, [setPageInfo, projectId, setProjectId, setInitialBudgetComparisonRequest])

    useEffect(() => {
        if (budgetComparisonSearchRequest.projectId) {
            loadBudgetComparison(budgetComparisonSearchRequest);
        }
    }, [budgetComparisonSearchRequest, loadBudgetComparison])

    const loadBudgetComparison = useCallback(async () => {
        setGlobalSpinState(true);
        try {
            const comparisonResponse = await ProjectsService.getBudgetComparison(budgetComparisonSearchRequest);
            setBudgetComparisonModel(comparisonResponse.data.data);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.BUDGET_COMPARISON.ERRORS.UNABLE_TO_LOAD_BUDGET_COMPARISON);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }, [budgetComparisonSearchRequest, setBudgetComparisonModel, setGlobalSpinState])

    const exportBudgetComparison = async () => {
        setGlobalSpinState(true);
        try {
            const comparisonResponse = await ProjectsService.exportBudgetComparison(budgetComparisonSearchRequest);
            var blob = new Blob([comparisonResponse.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const fileName = `budget_comparison_${budgetComparison?.project?.name}_${moment().utcOffset(-5).format('l')}.xlsx`.split(' ').join('_');
            FileSaver.saveAs(blob, fileName);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.PROJECTS.BUDGET_COMPARISON.ERRORS.UNABLE_TO_LOAD_BUDGET_COMPARISON);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    }

    const renderCellWithDollar = (cell, _row) => (
        <div className="cell-with-dollar">
            <p>$</p>
            {cell ? cell.toFixed(2) :'0.00'}
        </div>
    )

    const renderQuantity = (cell, _row) => (
            cell ? cell.toFixed(2) : '0.00'
    )

    const columns = [
        {
            title: 'Item',
            dataIndex: 'item',
            key: 'item',
            fixed: 'left'
        },
        {
            title: 'Description',
            dataIndex: 'title',
            key: 'title',
            width: 450,
            fixed: 'left',
            render: (cell, _row) => (<TextCropCell inputString={cell} title="Description" />)
        },
        {
            title: 'Contract',
            dataIndex: 'contract',
            children: [
                {
                    title: 'Quantity',
                    dataIndex: ['contract', 'quantity'],
                    key: 'quantity',
                    render: renderQuantity
                },
                {
                    title: 'Unit',
                    dataIndex: ['contract', 'amount'],
                    key: 'amount',
                    render: renderCellWithDollar
                },
                {
                    title: 'Amount',
                    dataIndex: ['contract', 'total'],
                    key: 'total',
                    render: renderCellWithDollar
                }
            ]
        },
        {
            title: 'Work In Place',
            dataIndex: 'workInPlace',
            children: [
                {
                    title: 'Previous',
                    dataIndex: ['previous'],
                    children: [
                        {
                            title: 'Quantity',
                            dataIndex: ['previous', 'quantity'],
                            key: 'quantity',
                            render: renderQuantity
                        }, {
                            title: 'Amount',
                            dataIndex: ['previous', 'amount'],
                            key: 'amount',
                            render: renderCellWithDollar
                        }
                    ]
                },
                {
                    title: 'This Period',
                    dataIndex: ['this'],
                    children: [
                        {
                            title: 'Quantity',
                            dataIndex: ['this', 'quantity'],
                            key: 'quantity',
                            render: renderQuantity
                        }, {
                            title: 'Amount',
                            dataIndex: ['this', 'amount'],
                            key: 'amount',
                            render: renderCellWithDollar
                        }
                    ]
                },
                {
                    title: 'To Date',
                    dataIndex: ['toDate'],
                    children: [
                        {
                            title: 'Quantity',
                            dataIndex: ['toDate', 'quantity'],
                            key: 'quantity',
                            render: renderQuantity
                        }, {
                            title: 'Amount',
                            dataIndex: ['toDate', 'amount'],
                            key: 'amount',
                            render: renderCellWithDollar
                        }
                    ]
                }, {
                    title: '%',
                    dataIndex: 'completed',
                    key: 'percentage',
                    align: 'center',
                    render: (cell, _row) => (
                        cell ? cell.toFixed(2) + '%' : '0.00%'
                    )
                }, {
                    title: '',
                    dataIndex: 'final',
                    fixed: 'right',
                    children: [
                        {
                            title: 'PFQ',
                            dataIndex: ['projectFinal', 'quantity'],
                            key: 'projectFinalQuantity'
                        },
                        {
                            title: ' PFA',
                            dataIndex: ['projectFinal', 'amount'],
                            key: 'projectFinalAmount',
                            render: renderCellWithDollar
                        }
                    ]
                }
            ]
        }
    ]

    const renderSummaryRow = pageData => {
        const budgetItem = budgetComparison.budgetItems.find(item => JSON.stringify(item.workOrders) == JSON.stringify(pageData))

        const summaryTextStyle = {
            fontSize: '16px',
            fontWeight: '500'
        }

        return (
            <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                 <Table.Summary.Cell />
                 <Table.Summary.Cell>
                    <Text style={summaryTextStyle}>{strings.PROJECTS.BUDGET_COMPARISON.LABELS.SUMMARY}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                    <Text style={summaryTextStyle}>{renderCellWithDollar(budgetItem.summary.contractSummary)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                    <Text style={summaryTextStyle}>{renderCellWithDollar(budgetItem.summary.previousSummary)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                     <Text style={summaryTextStyle}>{renderCellWithDollar(budgetItem.summary.thisSummary)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                    <Text style={summaryTextStyle}>{renderCellWithDollar(budgetItem.summary.toDateSummary)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                    <Text style={summaryTextStyle}>{renderCellWithDollar(budgetItem.summary?.finalSummary)}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        );
    }

    return (
        <>
            {Object.keys(budgetComparison).length !== 0 &&
                (
                    <div className="comparison-export">
                        <CustomBtn name="Export" className="work-order-export-action-btn" icon={<ExportOutlined style={{ fontSize: '18px' }} />} onClick={exportBudgetComparison} type="primary" />
                    </div>
                )
            }
            <div className="projects-layout">
                {Object.keys(budgetComparison).length !== 0 ? (
                    <>
                        <div className="filter-header">
                            <p>
                                {strings.PROJECTS.BUDGET_COMPARISON.LABELS.SUBCONTRACTOR}
                                <span>{budgetComparison.subcontractor}</span>
                            </p>
                            <p>
                                {strings.PROJECTS.BUDGET_COMPARISON.LABELS.PROJECT_NAME}
                                <span>{budgetComparison.project.name}</span>
                            </p>
                            <p>
                                {strings.PROJECTS.BUDGET_COMPARISON.LABELS.PREPARED_BY}
                                <span>{budgetComparison.preparedBy}</span>
                            </p>
                            <DatePicker.RangePicker onChange={(values) => setBudgetComparisonRequestDateRange(values)} />
                        </div>
                        <Collapse className="budget-comparison-collapse" defaultActiveKey={[0]}>
                            {!!budgetComparison.budgetItems &&
                                (budgetComparison.budgetItems?.map((item) => {
                                    return (
                                        <Panel header={item.category} key={item.id}>
                                            <Table
                                                bordered={true}
                                                columns={columns}
                                                dataSource={item.workOrders}
                                                size="large"
                                                style={tableStyle}
                                                summary={renderSummaryRow}
                                            />
                                        </Panel>
                                    )
                                }))
                            }
                        </Collapse>
                    </>) : (
                    <Empty />
                )
                }
            </div>
        </>
    )
}

const mapState = ({ budgetComparison }) => {
    return {
        budgetComparisonSearchRequest: budgetComparison.budgetComparisonSearchRequest,
        budgetComparison: budgetComparison.budgetComparison
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
        setProjectId(id) {
            dispatch(actions.setProjectId(id));
        },
        setBudgetComparisonModel(model) {
            dispatch(actions.setBudgetComparisonModel(model));
        },
        setBudgetComparisonRequestDateRange(values) {
            dispatch(actions.setBudgetComparisonRequestDateRange(values));
        },
        setInitialBudgetComparisonRequest() {
            dispatch(actions.setInitialBudgetComparisonRequest());
        }
    }
}

export default connect(mapState, mapDispatch)(BudgetComparisonTable);