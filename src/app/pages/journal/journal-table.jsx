import React, { useEffect, useState } from 'react';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './journal-reducer';
import { connect } from 'react-redux';
import { strings } from '../../constants';
import { Table, Checkbox, Button, Form, Tooltip, notification, Popconfirm, DatePicker, BackTop } from 'antd';
import { CustomInput, CustomBtn } from '../../components/common';
import { getErrorMessage } from '../../services/tracking.service';
import { SearchOutlined, FilterOutlined, LoadingOutlined, RedoOutlined } from '@ant-design/icons';
import { JournalService, TrackingService } from '../../services';
import ActionTag from './action-tag';
import { formatDate } from '../../helpers/date-time-helper';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
const { RangePicker } = DatePicker;


const JournalTable = (props) => {
    const [isLoading, setLoading] = useState(false);

    const [emailForm] = Form.useForm();

    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const getSearchFilters = async () => {
        try {
            const modulesResponse = await JournalService.getSearchFilters();

            props.setModules(modulesResponse.data.modules);
            props.setActions(modulesResponse.data.actions);
        }
        catch (error) {
            TrackingService.trackException(error);
        }
    }

    const getJournalActivity = async (searchModel) => {
        setLoading(true);
        try {
            const journalResponse = await JournalService.getJournalActivity(searchModel);

            props.setJournal(journalResponse.data);
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.GET_JOURNAL_ERROR);

            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
            props.setJournal([]);
        }
        setLoading(false);
    }

    useEffect(async () => {
        setLoading(true);

        await getSearchFilters();
        await getJournalActivity({ ...props.searchCriteria, pageNumber: props.pageNumber, pageSize: props.pageSize });

        props.setPageInfo(strings.PAGES.JOURNAL);
    }, [props.searchCriteria])

    const changeSearchCriteria = async () => {
        await getJournalActivity({ ...props.searchCriteria, pageNumber: props.pageNumber, pageSize: props.pageSize });
    }

    const handleTableChange = async (pagination, filters, sorter) => {
        props.setCurrentPage(pagination.current);
        props.setPageSize(pagination.pageSize);


        await getJournalActivity({
            ...props.searchCriteria,
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
            isAscend: sorter.order ? sorter.order === "ascend" : undefined,
            sortCriteria: sorter.column?.dataIndex ? props.mappedSortCriterias.find(item => item.dataIndex == sorter.column.dataIndex).name : undefined
        });
    }

    const renderActionCell = (cell, row) => {
        const restoreAllowed = row.action === "Delete" && (row.module == "Projects" || row.module == "Clients" || row.module == "Dispatch" || row.module == "Sites");
        const restoreFunction = async (id) => {
            try {
                if (row.module == "Projects") {
                    await JournalService.restoreProject(id);
                }

                if (row.module == "Clients") {
                    await JournalService.restoreClient(id);
                }

                if (row.module == "Dispatch") {
                    await JournalService.restoreDispatch(id);
                }

                if (row.module == "Sites") {
                    await JournalService.restoreSite(id);
                }

                notification['success']({
                    message: strings.COMMON.RECORD_RESTORED
                });

                await resetAllFilters();
            } catch (error) {
                const errorMessage = getErrorMessage(error, "Unable to restore record.");

                notification['error']({
                    message: errorMessage
                });

                TrackingService.trackException(error);
            }
        };

        return (
            restoreAllowed ? (
                <Popconfirm
                    placement="top"
                    title={strings.COMMON.RESTORE_RECORD_CONFIRM_TEXT}
                    onConfirm={() => restoreFunction(row.affectedRecordId)}
                    okText={strings.COMMON.OK}
                    cancelText={strings.COMMON.CANCEL}
                >
                    <Button className="delete-tag-action" danger>DELETE</Button>
                </Popconfirm>
            ) : (
                <ActionTag action={cell} />
            )
        );
    };

    const resetAllFilters = async () => {
        const resetModel = {
            email: '',
            sites: [],
            actions: [],
            modules: [],
            pageNumber: 1,
            pageSize: 200,
            dateRangeFrom: null,
            dateRangeTo: null
        }

        props.setSearchCriteria(resetModel);
        props.setCurrentPage(1);

        emailForm.resetFields();
    }

    const onDateRangeFilterChanged = (dates) => {
        props.setDateRangeFilter(dates);
    };

    const columns = [
        {
            title: 'User Email',
            dataIndex: 'userEmail',
            key: 'userEmail',
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <Form form={emailForm} onValuesChange={(changedValues) => props.setSearchCriteriaValue(changedValues.email, 'email')}>
                    <Form.Item name="email">
                        <div className="search-dropdown">
                            <CustomInput />
                            <CustomBtn type="primary" onClick={changeSearchCriteria} icon={<SearchOutlined />}>Search</CustomBtn>
                        </div>
                    </Form.Item>
                </Form>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px' }} />,
            render: text => <p style={{ color: '#03146f' }}>{text}</p>
        },
        {
            title: 'Site',
            dataIndex: 'site',
            key: 'site',
            sorter: true,
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <FilterBySiteDropdown value={props.searchCriteria.sites} onChange={props.setSearchCriteriaValue} option='sites' submit={changeSearchCriteria} />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px' }} />,
        },
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            sorter: true,
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <div className="checkbox-dropdown">
                    <Checkbox.Group style={{ width: '100%' }} value={props.searchCriteria.modules} onChange={(values) => props.setSearchCriteriaValue(values, 'modules')}>
                        {props.modules.map(item =>
                            <Checkbox key={item} value={item.toLowerCase()}>{item}</Checkbox>
                        )}

                        <Button type="primary" onClick={changeSearchCriteria}>Search</Button>
                    </Checkbox.Group>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px' }} />,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '5%',
            sorter: true,
            filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                <div className="checkbox-dropdown">
                    <Checkbox.Group style={{ width: '100%' }} value={props.searchCriteria.actions} onChange={(values) => props.setSearchCriteriaValue(values, 'actions')}>
                        {props.actions.map(item =>
                            <Checkbox key={item} value={item}>{item}</Checkbox>
                        )}

                        <Button type="primary" onClick={changeSearchCriteria}>Search</Button>
                    </Checkbox.Group>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px' }} />,
            render: renderActionCell
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: '30%',
            key: 'description',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: text => <p>{formatDate(text)}</p>,
            filterDropdown: (_) => (
                <RangePicker
                    className="start-date-picker"
                    value={[props.searchCriteria.dateRangeFrom?.toUTCKind().convertToEST(), props.searchCriteria.dateRangeTo?.toUTCKind().convertToEST()]}
                    onChange={(dates, _) => onDateRangeFilterChanged(dates)}
                    format={'MM-DD-YYYY'}
                    showTime={false}
                    showNow={false}
                />
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />
        }
    ];

    return (
        <>
            <div className="reset-btn">
                <Tooltip title={strings.COMMON.RESET_BTN_TEXT}>
                    <Button size="large" onClick={resetAllFilters} icon={<RedoOutlined />}></Button>
                </Tooltip>
            </div>
            <div className="journal-layout">
                <Table
                    key="createdAt"
                    rowKey="createdAt"
                    columns={columns}
                    bordered={true}
                    loading={{ spinning: isLoading, indicator: loadingIcon }}
                    onChange={handleTableChange}
                    dataSource={props.journalList}
                    rowClassName="journal-row"
                    pagination={{
                        current: props.pageNumber,
                        pageSize: props.pageSize,
                        total: props.recordsCount,
                        pageSizeOptions: [20, 50, 100, 150, 200],
                        showSizeChanger: true
                    }}
                />
            </div>
            <BackTop />
        </>
    )
}

const mapState = ({ journal, authorizedLayout }) => {
    return {
        journalList: journal.journalList,
        actions: journal.actions,
        modules: journal.modules,
        searchCriteria: journal.searchCriteria,
        allSites: authorizedLayout.allSites,
        recordsCount: journal.recordsCount,
        pageSize: journal.pageSize,
        pageNumber: journal.pageNumber,
        mappedSortCriterias: journal.mappedSortCriterias
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [] }));
        },
        setModules(values) {
            dispatch(actions.setModules(values));
        },
        setActions(values) {
            dispatch(actions.setActions(values));
        },
        setJournal(values) {
            dispatch(actions.setJournalList(values));
        },
        setSearchCriteria(values) {
            dispatch(actions.setSearchCriteria(values));
        },
        setCurrentPage(value) {
            dispatch(actions.setCurrentPage(value))
        },
        setPageSize(value) {
            dispatch(actions.setPageSize(value));
        },
        setSearchCriteriaValue(values, fieldName) {
            dispatch(actions.setSearchCriteriaValue(values, fieldName))
        },
        setDateRangeFilter(value) {
            dispatch(actions.setDateRangeFilter(value));
        }
    }
}

export default connect(mapState, mapDispatch)(JournalTable);
