import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { CustomBtn, CustomInput, CustomSingleOptionSelect, SearchInput, TextCropCell } from '../../components/common/';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from './break-list.reducer';
import {
    pageNumbers,
    reportProps,
    roles,
    strings
} from '../../constants';
import {
    WET_MATERIAL_TARE,
    DRY_MATERIAL_TARE,
    TARE,
    NO_OF_BLOWS,
} from '../../constants/report-props';
import reportTypesIds, { reportTypesGroup } from "../../constants/report-types";
import { Table, notification, BackTop, DatePicker, Tooltip } from 'antd';
import {
    SearchOutlined,
    CloseCircleOutlined,
    FilterOutlined,
    ExportOutlined,
    EditOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { useDebouncedCallback } from 'use-debounce';
import { downloadFileFromFileResponse } from '../../helpers/file-download-helper';
import BreakListService from '../../services/break-list.service';
import EditTestModal from './update-test.modal';
import { renderProjectSiteById } from '../../components/common/filter-by-site-dropdown';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
import { GRAPH_COORDINATES } from '../../constants/report-props';
import TextCrop from '../../components/common/text-crop';
import { formatBreakListDate } from '../../helpers/date-time-helper';
import { ReportsService, UserManagement } from '../../services';
import { handleInjectedScripts } from '../../helpers/project-report-data-helper';
import { useReactToPrint } from 'react-to-print';
import { EditableCell, EditableRow } from './break-list-editable-row';
import { calculateArea, calculateCompressiveStrength } from '../../helpers/math-helper';
import { AddZerosToReportNumber } from '../../helpers/add-zeros-to-numbers';
import { cylindersSize } from '../../constants/cylinders-size';

const { RangePicker } = DatePicker;

const BreakListPage = (props) => {
    const {
        breakListSearchRequest,
        setPaginatedBreakList,
        setBreakListSearchRequestSorter,
        setPageInfo,
        setBreakListSearchRequestDateRange,
        reportType,
        filteredSites,
        setPreparedFilteredSites,
        setFilteredSites,
        allSites,
        reportTypeGroup,
        setGlobalSpinState,
        breakListWithoutPagination,
        filteredSitesByDate,
        setFilteredSitesByDate
    } = props;

    const [isBreakListLoading, setBreakListLoading] = useState();
    const [isEmpty, setIsEmpty] = useState(false);
    const [filterButtons, setFilterButtons] = useState();
    const [columns, setColumns] = useState([]);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isSearchDate, setSearchDate] = useState();
    const [userNameSelectOptions, setUserNameSelectOptions] = useState([]);
    const [size, setSize] = useState();
    const [isEditModalVisible, setEditModalVisible] = useState({
        visible: false,
        record: null
    });
    const searchInputRef = useRef('');
    const reportRef = useRef();

    const filterSitesByDate = async () => {
        setBreakListLoading(true);
        await handleGetBreakListByDate(isSearchDate);
        setBreakListLoading(false);
    };

    const getExtraPropsForColumns = useMemo(
        () => (dateFrom, dateTo, onBreakAgeFilterChanged) => {
            return [
                {
                    columnIndex: 'breakDate',
                    props: {
                        filterDropdown: (_) => (
                            <RangePicker
                                className="start-date-picker"
                                value={[dateFrom?.toUTCKind().convertToEST(), dateTo?.toUTCKind().convertToEST()]}
                                onChange={(dates, _) => onBreakAgeFilterChanged(dates)}
                                format={strings.FIELD_FORMATS.DEFAULT_DATE_TIME_BREAK_LIST_FORMAT}
                                showTime={false}
                                showNow={false}
                            />
                        ),
                        render: date => <div className="info-col"><p>{formatBreakListDate(date)}</p></div>,
                        filterIcon: filtered => !isSearchDate && <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />
                    }
                },
                {
                    columnIndex: 'siteId',
                    props: {
                        render: (_cell, row) => renderProjectSiteById(_cell, row, allSites),
                        filterDropdown: ({ _setSelectedKeys, _selectedKeys, _confirm, _clearFilters }) => (
                            <FilterBySiteDropdown isById={true} value={isSearchDate ? filteredSitesByDate : filteredSites} onChange={isSearchDate ? setFilteredSitesByDate : setPreparedFilteredSites} submit={isSearchDate ? filterSitesByDate : setFilteredSites} />
                        ),
                        filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined, fontSize: '20px', pointerEvents: 'all' }} />
                    }
                },
                {
                    columnIndex: GRAPH_COORDINATES.dataIndex,
                    props: {
                        render: (_cell, row) => {
                            const mergedString = row[GRAPH_COORDINATES.dataIndex]?.map(item => ` (${item.dryDensity?.toFixed(2)}, ${item.moistureContent?.toFixed(2)})`);
                            return (
                                <div className="dispatch-info-col">
                                    <TextCrop inputString={mergedString} />
                                </div>
                            )
                        }
                    }
                }
            ];
        },
        [allSites, filteredSites, setFilteredSites, setPreparedFilteredSites, filteredSitesByDate, setFilteredSitesByDate]
    );

    const clearAllFilters = async () => {
        setFilteredSitesByDate([]);
        setSize(null);
        setSearchDate(null);
        await loadBreakList();
    }

    const extraPropsForColumns = useMemo(
        () => getExtraPropsForColumns(props.breakListSearchRequest.dateFrom, props.breakListSearchRequest.dateTo, setBreakListSearchRequestDateRange),
        [getExtraPropsForColumns, props.breakListSearchRequest.dateFrom, props.breakListSearchRequest.dateTo, setBreakListSearchRequestDateRange]
    );

    const loadBreakList = useCallback(async () => {
        try {
            let breakListResponse;
            switch (reportTypeGroup) {
                case reportTypesGroup.CONCRETE:
                    breakListResponse = await BreakListService.searchAllConcreteByRequest({
                        ...breakListSearchRequest,
                        reportTypeId: reportType,
                        searchDate: isSearchDate
                    });
                    break;

                case reportTypesGroup.SOIL:
                    breakListResponse = await BreakListService.searchAllSoilByRequest({
                        ...breakListSearchRequest,
                        reportTypeId: reportType
                    });
                    break;

                default:
                    break;
            }
            setPaginatedBreakList(breakListResponse.data.data);
            setIsEmpty(breakListResponse.data.data.length === 0 && !props.breakListSearchRequest.isFiltered);
            await loadAllTechnicians();
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.FETCH_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }, [breakListSearchRequest, reportType, reportTypeGroup, setPaginatedBreakList]);

    const loadAllTechnicians = async () => {
        try {
            const usersResponse = await UserManagement.getAllUsers();
            if (usersResponse.status == 200) {
                const userNameOptions = usersResponse.data.data.filter(user => user.roles.includes(roles.TECHNICIAN)).map(user => {
                    return {
                        value: user.userName,
                        displayValue: user.userName
                    }
                })
                setUserNameSelectOptions(userNameOptions);
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.GET_USERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const getSortOrderPerColumn = useCallback((columnName) => {
        return props.breakListSearchRequest.sortCriteria === columnName
            ? props.breakListSearchRequest.isAscend ? 'ascend' : 'descend'
            : undefined;
    }, [props.breakListSearchRequest.isAscend, props.breakListSearchRequest.sortCriteria]);

    const getCellValue = (input) => {

        return typeof input === 'number' ? input.toFixed(2) : input;
    }

    const getCellValueOrNA = (input) => {
        return input ? input.toFixed(2) : "N/A";
    }

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        onBeforePrint: () => props.setGlobalSpinState(false),
        onAfterPrint: () => document.getElementById("break-list-pdf-doc-elem").innerHTML = ''
    });

    const handleReportDownload = async (dispatchRequestWorkOrderId, reportTypeId) => {
        try {
            setGlobalSpinState(true);
            const downloadResponse = await ReportsService.downloadReport(dispatchRequestWorkOrderId);
            document.getElementById("break-list-pdf-doc-elem").innerHTML = downloadResponse.data;
            handleInjectedScripts(reportTypeId);
            handlePrint();
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_DOWNLOAD_REPORT);
            notification['error']({
                message: errorMessage,
            });
        }
        setGlobalSpinState(false);
    };

    const getSiteNameById = (siteId) => {
        const site = allSites.filter(s => s.id === siteId)[0].name;
        return site;
    }

    const renderBreakAge = (row, item) => {
        return(
            row["breakAgeHours"] > 0 
                ? `${row[item.dataIndex]}d ${row["breakAgeHours"]}h`
                : `${row[item.dataIndex]}d` 
        )
    }

    const generateColumns = useCallback(() => {
        if (Object.keys(reportProps).some(item => item == props.reportType)) {
            setColumns([...reportProps[props.reportType]?.map(item => {
                return {
                    title: item.name,
                    dataIndex: item.dataIndex,
                    key: item.dataIndex,
                    sorter: true,
                    editable: item.isEditable,
                    isNumber: item.isNumber,
                    isDate: item.isDate,
                    sorterProp: item.sorterProp,
                    sortOrder: getSortOrderPerColumn(item.sorterProp),
                    width: item.width,
                    render: (_, row) => (
                        <div className="info-col"
                            key={item.dataIndex}
                            tabIndex={item.isEditable ? 0 : null}>
                            <p>{
                                (item.dataIndex === "projectNumber" ||
                                    item.dataIndex === "setNumber" ||
                                    item.dataIndex === "specimenNumber")
                                    ? row[item.dataIndex]
                                    : item.dataIndex === "breakDate"
                                        ? formatBreakListDate(row[item.dataIndex])
                                        : item.dataIndex === "siteId" && isSearchDate
                                            ? getSiteNameById(row[item.dataIndex])
                                            : (item.dataIndex === "compressiveStrength" || item.dataIndex === "maximumLoad") && !isNaN(row[item.dataIndex])
                                                ? Number(getCellValue(row[item.dataIndex])).toFixed()
                                                : item.dataIndex === "sampleReportNumber"
                                                    ? AddZerosToReportNumber(row[item.dataIndex])
                                                    : item.dataIndex === "breakAge"
                                                        ? renderBreakAge(row, item)
                                                        : (item?.dataIndex == WET_MATERIAL_TARE?.dataIndex || item?.dataIndex == TARE?.dataIndex
                                                            || item?.dataIndex == DRY_MATERIAL_TARE?.dataIndex || item?.dataIndex == NO_OF_BLOWS?.dataIndex)
                                                            ? getCellValueOrNA(row[item.dataIndex])
                                                            : getCellValue(row[item.dataIndex])
                            }</p>
                        </div>
                    ),
                    ...extraPropsForColumns.find(i => i.columnIndex == item.dataIndex)?.props
                }
            }), {
                fixed: 'right',
                width: '5%',
                render: (_, row) =>
                    <div className="dispatch-info-col" key='edit-column'>
                        <EditOutlined onClick={() => handleEditModalOpen(row)} />
                        <Tooltip title={strings.COMMON.DOWNLOAD_REPORT} placement="topRight">
                            <DownloadOutlined onClick={() => handleReportDownload(row.dispatchRequestWorkOrderId, reportType)} />
                        </Tooltip>
                    </div>
            }]);
        }
    }, [props.reportType, getSortOrderPerColumn, extraPropsForColumns, breakListWithoutPagination]);

    const generateFilterButtons = useCallback(() => {
        setFilterButtons(reportProps[props.reportType]?.map(item => {
            if (item.isFiltering) {
                return (
                    <CustomBtn name={item.name} onClick={() => setBreakListSearchRequestSorter(item.sorterProp, !breakListSearchRequest.isAscend)} type="search" key={item.dataIndex} />
                )
            }
        }));
    }, [breakListSearchRequest.isAscend, props.reportType, setBreakListSearchRequestSorter]);

    useEffect(() => {
        generateColumns();
        generateFilterButtons();
    }, [props.reportType, props.breakListSearchRequest, generateColumns, generateFilterButtons])

    useEffect(() => {
        setBreakListLoading(true);
        loadBreakList().then(() => {
            setBreakListLoading(false);
        });
    }, [loadBreakList, props.breakListSearchRequest])

    useEffect(() => {
        setPageInfo(strings.PAGES.BREAK_LIST, pageNumbers.BREAK_LIST);
    }, [setPageInfo]);

    const clearSortAndFilters = () => {
        props.setInitialBreakListSearchRequest();
        searchInputRef.current.state.value = "";
    };

    const setSearch = useDebouncedCallback((searchString) => {
        props.setBreakListSearchRequestCriteria(searchString);
    }, 400);

    const handleTableChange = (pagination, _filters, _sorter) => {
        props.setBreakListSearchRequestPagination(pagination.pageSize, pagination.current)
    };

    const exportBreakList = async () => {
        try {
            let fileResponse;

            switch (reportTypeGroup) {
                case reportTypesGroup.CONCRETE:
                    if (isSearchDate) {
                        fileResponse = await BreakListService.exportConcreteBreakListByDate({
                            selectedDate: isSearchDate,
                            reportTypeId: reportType
                        });
                    } else {
                        fileResponse = await BreakListService.exportConcreteBreakList({
                            ...breakListSearchRequest,
                            reportTypeId: reportType
                        });
                    }
                    break;

                case reportTypesGroup.SOIL:
                    fileResponse = await BreakListService.exportSoilBreakList({
                        ...breakListSearchRequest,
                        reportTypeId: reportType
                    });
                    break;
                default:
                    break;
            }

            downloadFileFromFileResponse("text/csv", fileResponse);
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.EXPORT_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const handleGetBreakListByDate = async (date) => {
        try {
            setSearchDate(date);
            setBreakListLoading(true);
            setSize(null);

            var breakListResponse = await BreakListService.searchAllConcreteByRequest({
                ...breakListSearchRequest,
                searchDate: date,
                reportTypeId: reportType,
                sitesIds: filteredSitesByDate.filter(item => item != "Rone" && item != "JRB")
            });

            setPaginatedBreakList(breakListResponse.data.data);
            setBreakListLoading(false);
        }
        catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.FETCH_ERROR);
            notification['error']({
                message: errorMessage,
            });
            setBreakListLoading(false);
            setSearchDate(null);
        }
    };

    const handleEditModalOk = () => {
        setEditModalVisible({
            visible: false,
            record: null
        });
    }

    const handleEditModalCancel = () => {
        setEditModalVisible({
            visible: false,
            record: null
        });
    }

    const handleEditModalOpen = (row) => {
        setEditModalVisible({
            visible: true,
            record: row
        })
    }

    const handleEdit = async (row) => {
        try {
            if (isSearchDate) {
                props.updateSpecInfoWithoutPagination(row.breakListItemId, row);
            } else {
                props.updateSpecInfo(row.breakListItemId, row);
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const handleEditSave = async (row) => {
        try {
            let editSpecResponse;

            switch (reportTypeGroup) {
                case reportTypesGroup.CONCRETE:
                    editSpecResponse = await BreakListService.updateConcreteSpecInfo({
                        barcode: row.barcode,
                        ...row
                    });
                    break;

                case reportTypesGroup.SOIL:
                    editSpecResponse = await BreakListService.updateSoilSpecInfo([{
                        barcode: row.barcode,
                        ...row
                    }]);
                    break;

                default:
                    break;
            }

            if (editSpecResponse.status == 200) {
                notification['success']({
                    message: strings.BREAK_LIST.LABELS.UPDATED_SPEC
                });

                if (isSearchDate) {
                    props.updateSpecInfoWithoutPagination(row.breakListItemId, row);
                } else {
                    props.updateSpecInfo(row.breakListItemId, row);
                }
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const handleUpdateTestedBy = async (row) => {
        try {
            if (isSearchDate) {
                const updateTestedBy = breakListWithoutPagination.map(i => {
                    return {
                        ...i,
                        fracture: i?.fractureType,
                        fractureType: i?.fractureType,
                        testedBy: row.testedBy
                    }
                });

                var byDateEditSpecResponse = await BreakListService.updateMultipleTestedBy(updateTestedBy);

                if (byDateEditSpecResponse.status == 200) {
                    notification['success']({
                        message: strings.BREAK_LIST.LABELS.UPDATED_SPEC
                    });

                    byDateEditSpecResponse.data.data.map(i => {
                        props.updateSpecInfoWithoutPagination(i.id, i);
                    });
                }
            } else {
                const updateTestedBy = props.paginatedBreakList.data.map(i => {
                    return {
                        ...i,
                        fracture: i?.fractureType,
                        fractureType: i?.fractureType,
                        testedBy: row.testedBy
                    }
                });

                var editSpecResponse = await BreakListService.updateMultipleTestedBy(updateTestedBy);

                if (editSpecResponse.status == 200) {
                    notification['success']({
                        message: strings.BREAK_LIST.LABELS.UPDATED_SPEC
                    });

                    editSpecResponse.data.data.map(i => {
                        props.updateSpecInfo(i.id, i);
                    });
                }
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const handleEditDiameter = async (value) => {
        try {
            let updateDiameter;
            if (size === cylindersSize[0].value || size === cylindersSize[1].value) {
                updateDiameter = breakListWithoutPagination.filter(s => s.specSize === size).map(i => {
                    var newArea = value ? calculateArea(value) : null;
                    return {
                        ...i,
                        fracture: i?.fractureType,
                        fractureType: i?.fractureType,
                        diameter: value,
                        area: newArea,
                        compressiveStrength: i?.maximumLoad && newArea ? calculateCompressiveStrength(i?.maximumLoad, newArea) : 0,
                        maximumLoad: i?.maximumLoad
                    }
                });

                updateDiameter.map(i => {
                    props.updateSpecInfoWithoutPagination(i.breakListItemId, i);
                });
            } else {
                updateDiameter = breakListWithoutPagination.map(i => {
                    var newArea = value ? calculateArea(value) : null;
                    return {
                        ...i,
                        fracture: i?.fractureType,
                        fractureType: i?.fractureType,
                        diameter: value,
                        area: newArea,
                        compressiveStrength: i?.maximumLoad && newArea ? calculateCompressiveStrength(i?.maximumLoad, newArea) : 0,
                        maximumLoad: i?.maximumLoad
                    }
                });

                updateDiameter.map(i => {
                    props.updateSpecInfoWithoutPagination(i.breakListItemId, i);
                });
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const handleSaveDiameter = async () => {
        try {
            let editSpecResponse;

            if (size === cylindersSize[0].value || size === cylindersSize[1].value) {
                const updateDiameter = breakListWithoutPagination.filter(s => s.specSize === size).map(i => {
                    return {
                        ...i
                    }
                });

                editSpecResponse = await BreakListService.updateMultipleTestedBy(updateDiameter);
            } else {
                const updateDiameter = breakListWithoutPagination.map(i => {
                    return {
                        ...i
                    }
                });

                editSpecResponse = await BreakListService.updateMultipleTestedBy(updateDiameter);
            }

            if (editSpecResponse.status == 200) {
                notification['success']({
                    message: strings.BREAK_LIST.LABELS.UPDATED_SPEC
                });

                editSpecResponse.data.data.map(i => {
                    props.updateSpecInfoWithoutPagination(i.id, i);
                });
            }
        } catch (error) {
            TrackingService.trackException(error);
            const errorMessage = getErrorMessage(error, strings.BREAK_LIST.ERRORS.UPDATE_SPEC_ERROR);
            notification['error']({
                message: errorMessage
            });
        }
    }

    const editableColumns = columns.map((col) => {
        if (col?.dataIndex == WET_MATERIAL_TARE?.dataIndex || col?.dataIndex == TARE?.dataIndex
            || col?.dataIndex == DRY_MATERIAL_TARE?.dataIndex || col?.dataIndex == NO_OF_BLOWS?.dataIndex) {
                return {
                    ...col,
                    onCell: (record) => ({
                        record,
                        title: col.title,
                        dataIndex: col.dataIndex,
                        editable: col.editable,
                        isNumber: col.isNumber,
                        isDate: col.isDate,
                        sorterProp: col.sorterProp,
                        reportType: reportType,
                        userNameSelectOptions: userNameSelectOptions,
                        handleEdit: handleEdit,
                        handleSave: handleEditSave,
                    })
                };
            }

        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                title: col.title,
                dataIndex: col.dataIndex,
                editable: col.editable,
                isNumber: col.isNumber,
                isDate: col.isDate,
                sorterProp: col.sorterProp,
                reportType: reportType,
                userNameSelectOptions: userNameSelectOptions,
                handleSave: handleEditSave,
                handleEdit: handleEdit,
                handleSaveTestedBy: handleUpdateTestedBy
            })
        };
    });

    return (
      <>
        <div className="table-top" style={{ alignItems: "flex-start" }}>
          <div
            className="action-btn-group"
            style={{ alignItems: "flex-start", height: '160px' }}
          >
            {!isEmpty && (
              <>
                <h2>{strings.COMMON.SORT_BY}</h2>
                <div
                  className={
                    reportType !== reportTypesIds.CONCRETE_MORTAR
                      ? "filter-buttons-concrete-core"
                      : "filter-buttons"
                  }
                >
                  {filterButtons}
                </div>
                <SearchInput
                  defaultValue={props.breakListSearchRequest.searchCriteria}
                  searchInputRef={searchInputRef}
                  placeholder="Custom Search"
                  onChange={(e) => setSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                />
                <CustomBtn
                  style={{ marginTop: "7px" }}
                  className="cancel-btn"
                  onClick={clearSortAndFilters}
                  icon={<CloseCircleOutlined />}
                />
              </>
            )}
          </div>
          <div className="add-client-btn work-orders-btn-action-group">
            {reportTypeGroup === reportTypesGroup.CONCRETE && (
              <div className="search-by-date-block">
                {breakListWithoutPagination?.length > 0 && (
                  <div className="average-diameter">
                    <CustomSingleOptionSelect
                      allowClear
                      name={[strings.BREAK_LIST.LABELS.CYLINDER_SIZE]}
                      placeholder={[strings.BREAK_LIST.LABELS.CYLINDER_SIZE]}
                      options={cylindersSize}
                      handleChange={setSize}
                    />
                    {size && (
                      <CustomInput
                        name={[strings.BREAK_LIST.LABELS.AVERAGE_DIAMETER]}
                        placeHolder={strings.BREAK_LIST.LABELS.AVERAGE_DIAMETER}
                        type="number"
                        normalize={(e) => Number(e)}
                        onInputChange={(e) =>
                          handleEditDiameter(e.target.value)
                        }
                        onPressEnter={handleSaveDiameter}
                        onBlur={handleSaveDiameter}
                      />
                    )}
                  </div>
                )}
                <CustomBtn
                  name={strings.BREAK_LIST.LABELS.SEARCH_BY_DATE}
                  className="break-list-search-by-date-action-btn"
                  onClick={() => setDatePickerOpen((prev) => !prev)}
                  type="primary"
                />
                <DatePicker
                  onOpenChange={setDatePickerOpen}
                  open={isDatePickerOpen}
                  allowClear={false}
                  className="custom-date-picker"
                  onChange={(date) => handleGetBreakListByDate(date)}
                />
                {!isEmpty && (
                  <CustomBtn
                    name={strings.BREAK_LIST.LABELS.CLEAR_SEARCH_BY_DATE}
                    className="break-list-clear-search-by-date-action-btn"
                    onClick={clearAllFilters}
                    type="primary"
                  />
                )}
              </div>
            )}
            <CustomBtn
              name="Export"
              className="work-order-export-action-btn"
              icon={<ExportOutlined style={{ fontSize: "18px" }} />}
              onClick={exportBreakList}
              type="primary"
            />
          </div>
        </div>
        <div
          className="client-list-layout"
        >
          <div className="dispatch-table break-list">
            <Table
              sticky
              bordered
              key="breakListItemId"
              rowKey="breakListItemId"
              rowClassName={"custom-table-row"}
              components={{
                body: {
                  row: EditableRow,
                  cell: EditableCell,
                },
              }}
              showSorterTooltip={false}
              dataSource={
                props.paginatedBreakList.data
              }
              columns={editableColumns}
              loading={isBreakListLoading}
              scroll={{ x: "125vw", y: 'calc(69vh - 200px)' }}
              onChange={!isSearchDate ? handleTableChange : null}
              pagination={
                isSearchDate
                  ? false
                  : {
                      current: props.breakListSearchRequest.pageNumber,
                      pageSize: props.breakListSearchRequest.pageSize,
                      total: props.paginatedBreakList.recordsCount,
                      pageSizeOptions: [7, 15, 100, 150, 200],
                      showSizeChanger: true,
                    }
              }
            />
          </div>
        </div>
        <EditTestModal
          editModalVisible={isEditModalVisible}
          handleOk={handleEditModalOk}
          handleCancel={handleEditModalCancel}
          isSearchDate={isSearchDate}
          breakListWithoutPagination={breakListWithoutPagination}
          userNameSelectOptions={userNameSelectOptions}
        />
        <BackTop />
        <div style={{ position: "absolute", left: "-3999px" }}>
          <div id="break-list-pdf-doc-elem" ref={reportRef}></div>
        </div>
      </>
    );
}

const mapState = ({ breakList, authorizedLayout }) => {
    return {
        allSites: authorizedLayout.allSites,
        breakListSearchRequest: breakList.breakListSearchRequest,
        paginatedBreakList: breakList.paginatedBreakList,
        reportType: breakList.reportTypeId,
        filteredSites: breakList.filteredSites,
        reportTypeGroup: breakList.reportTypeGroup,
        breakListWithoutPagination: breakList.breakListWithoutPagination,
        filteredSitesByDate: breakList.filteredSitesByDate
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [pageKey] }));
        },
        setPaginatedBreakList(value) {
            dispatch(actions.setPaginatedBreakList(value));
        },
        setBreakListSearchRequestCriteria(value) {
            dispatch(actions.setBreakListSearchRequestCriteria(value));
        },
        setInitialBreakListSearchRequest() {
            dispatch(actions.setInitialBreakListSearchRequest());
        },
        updateTestedBy(id, value) {
            dispatch(actions.updateTestedBy(id, value));
        },
        setBreakListSearchRequestSorter(property, isAscend) {
            dispatch(actions.setBreakListSearchRequestSorter({
                isAscend: isAscend,
                sortCriteria: property
            }));
        },
        setBreakListSearchRequestPagination(pageSize, currentPage) {
            dispatch(actions.setBreakListSearchRequestPagination({
                pageSize: pageSize,
                currentPage: currentPage
            }));
        },
        setBreakListSearchRequestDateRange(value) {
            dispatch(actions.setBreakListSearchRequestDateRange(value));
        },
        setPreparedFilteredSites(value) {
            dispatch(actions.setPreparedFilteredSites(value));
        },
        setFilteredSites() {
            dispatch(actions.setFilteredSites());
        },
        setGlobalSpinState(value) {
            dispatch(globalActions.setGlobalSpinState(value));
        },
        setBreakListWithoutPagination(value) {
            dispatch(actions.setBreakListWithoutPagination(value));
        },
        updateSpecInfo(id, values) {
            dispatch(actions.updateSpecInfo(id, values));
        },
        updateSpecInfoWithoutPagination(id, values) {
            dispatch(actions.updateSpecInfoWithoutPagination(id, values));
        },
        setFilteredSitesByDate(value) {
            dispatch(actions.setFilteredSitesByDate(value));
        }
    }
}

export default connect(mapState, mapDispatch)(BreakListPage);