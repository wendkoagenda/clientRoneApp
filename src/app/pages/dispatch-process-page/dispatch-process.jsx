import React, { useState, useEffect, useRef } from "react";
import { Button, List, Collapse, notification, Spin, Tooltip, Popover, DatePicker, Popconfirm, Skeleton, AutoComplete } from "antd";
import { connect } from "react-redux";
import { actions as globalActions } from "../../store/reducers/authorized-layout.reducer";
import { actions } from "./dispatch-process-reducer";
import { DispatchService, TrackingService, UserManagement } from "../../services";
import routes from '../routes';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WorkOrderBadge from "./dispatch-process-dnd/work-order-badge";
import WorkOrderDropArea from "./dispatch-process-dnd/work-order-drop-area";
import { strings, actionTypesDispatchProcess, sitesLocations, sites, workOrderStatuses, pageNumbers } from "../../constants";
import {
    RightOutlined,
    LeftOutlined,
    LoadingOutlined,
    NotificationOutlined,
    ExpandOutlined,
    UndoOutlined,
    FilterOutlined,
    CloseOutlined
} from "@ant-design/icons";
import HardHatSolid from '../../components/icons/hard-hat-solid';
import {
    createTimeline,
    DEFAULT_UTC_OFFSET,
    HOURS_IN_DAY,
    isCurrentTime,
    MINUTES_IN_HOUR,
    TIMELINE_CELL_WIDTH,
    TIMELINE_RESOLUTION_IN_FIFTEEN
} from '../../helpers/timeline-helper';
import moment from 'moment';
import { HubConnectionBuilder } from '@microsoft/signalr';
import getConfig from "../../../app/config";
import NotificationManagementModal from './notification-management';
import LocationArrowSolid from '../../components/icons/location-icon';
import { CustomSingleOptionSelect, CustomBtn } from "../../components/common";
import TechLocationMap from './tech-location-map';
import { List as VirtualList } from "react-virtualized";
import useLocalStorage from 'react-use-localstorage';
import _useLocalStorage from '../../helpers/local-storage-helper';
import { attachColors, WACO_POSITION, DEFAULT_ZOOM_VALUE, DEFAULT_INDEX_TO_SCROLL, localStoragesValuesNames } from "../../helpers/map-helper";
import { getErrorMessage } from "../../services/tracking.service";
import { groupBy } from "lodash";
import CustomDragLayer from './dispatch-process-dnd/custom-drag-layer';
import FilterBySiteDropdown from '../../components/common/filter-by-site-dropdown';
import { getOrderBadgeColor, orderDetailsPopover } from "../../helpers/badge-style-helper";
import { DEFAULT_TIME_ZONE, UTC_TIME_ZONE } from "../../helpers/date-time-helper";
import TransportationChargePopover from './dispatch-process-dnd/transportation-charge.popover';
import LocalStorageService from "../../services/local-storage.service";

const { Panel } = Collapse;

const DispatchProcess = (props) => {
    const { timelineValues } = props;

    const [isLoadingState, setIsLoadingState] = useLocalStorage(localStoragesValuesNames.IS_LOADING_STATE, false);
    const [centerPosition, setCenterPosition] = useLocalStorage(localStoragesValuesNames.CENTER_POSITION, WACO_POSITION);
    const [zoomValue, setZoomValue] = useLocalStorage(localStoragesValuesNames.ZOOM_VALUE, DEFAULT_ZOOM_VALUE);
    const [isFullMap, setIsFullMap] = _useLocalStorage(localStoragesValuesNames.IS_FULL_MAP, false);
    const [indexToScroll, setIndexToScroll] = useLocalStorage(localStoragesValuesNames.INDEX_TO_SCROLL, undefined);

    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [globalSpin, setGlobalSpinState] = useState(false);
    const [currentSelectedSite, setCurrentSelectedSite] = useState();
    const [siteOptionsWithoutAllOption, setSiteOptionsWithoutAllOption] = useState([]);
    const [isNotificationModalVisible, setNotificationIsModalVisible] = useState(false);
    const [isOpenPicker, setIsOpenPicker] = useState(false);
    const [popoverSite, setPopoverSite] = useState({ id: 0, visible: false });
    const [activeKeys, setActiveKeys] = useState([]);
    const [loadedRows, setLoadedRows] = useState({
        startIndex: 0,
        stopIndex: 0
    });

    const SCROLL_OFFSET = TIMELINE_CELL_WIDTH * 5;

    const isFirstRun = useRef(true);

    const virtualList = document.querySelector('.tech-virtual-list')
    const timeScale = document.querySelector('.time-scale')

    const loadingIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;

    const dispatchSpinStyle = {
        position: 'absolute',
        left: '65%',
        top: isFullMap ? '55%' : '80%',
        color: '#03146F'
    }

    useEffect(() => {
        const keys = LocalStorageService.getKeysData(activeKeys);
        if (keys) {
            setActiveKeys(keys);
        }
    }, []);

    useEffect(() => {
        const listener = (_) => {

            timeScale.scrollLeft = virtualList.scrollLeft;
        }

        virtualList?.addEventListener('scroll', listener)

        return () => {
            virtualList?.removeEventListener('scroll', listener);
        }
    }, [timeScale, virtualList])

    useEffect(() => {
        setIndexToScroll(Number(indexToScroll));
        setIsLoadingState(false);
    }, [indexToScroll, zoomValue, centerPosition, setIsLoadingState, setIndexToScroll])

    useEffect(() => {
        const selectOptions = props.allSites.length && props.allSites.map(item => {
            return {
                key: item.id,
                value: item.name,
            };
        });

        setSiteOptionsWithoutAllOption(selectOptions);
    }, [props.allSites])

    useEffect(() => {
        if (!isFirstRun.current) {
            loadCompletedWorkOrdersBySelectedDate(props.date);
        } else {
            isFirstRun.current = false;
        }
    }, [props.date])

    const setupAssignOrderConnection = () => {
        const connection = new HubConnectionBuilder()
            .withUrl(`${getConfig().apiBaseUrl}/hubs/assign-order`)
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveWorkOrder', assignedOrderModel => {
            const alreadyAssignedWorkOrder = props.assignedWorkOrders.find(item => (item.workOrderId == assignedOrderModel.workOrderId && item.dispatchRequestId == assignedOrderModel.dispatchRequestId));

            switch (assignedOrderModel.actionType) {
                case actionTypesDispatchProcess.ASSIGN:
                    if (!alreadyAssignedWorkOrder) {
                        props.assignWorkOrder(assignedOrderModel.id, assignedOrderModel.startAt, assignedOrderModel.technicianId, assignedOrderModel.endAt, assignedOrderModel.statusId);
                    }
                    break;

                case actionTypesDispatchProcess.UPDATE:
                    props.changeWorkOrder(assignedOrderModel.id, assignedOrderModel.startAt, assignedOrderModel.technicianId, assignedOrderModel.endAt, assignedOrderModel.statusId, assignedOrderModel?.transportationChargeId);
                    break;

                case actionTypesDispatchProcess.CANCEL:
                    props.unassignWorkOrder(assignedOrderModel.id, assignedOrderModel.statusId);
                    break;

                case actionTypesDispatchProcess.CONFIRMED:
                    props.confirmWorkOrders(assignedOrderModel);
                    break;

                case actionTypesDispatchProcess.NOTIFIED:
                    props.sendWorkOrderNotification(assignedOrderModel);
                    break;

                case actionTypesDispatchProcess.COMPLETED:
                    props.completeWorkOrder(assignedOrderModel);
                    break;

                default:
                    props.unassignWorkOrder(assignedOrderModel.id, assignedOrderModel.statusId);
                    break;
            }
        });

        return connection;
    };

    const setupTechnicianHubConnection = () => {
        const connection = new HubConnectionBuilder()
            .withUrl(`${getConfig().apiBaseUrl}/hubs/technician-location`)
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveTechnicianLocation', updatedTechnicians => {
            const technicians = attachColors(updatedTechnicians);
            props.setTechnicians(technicians);
            props.setCurrentSites(props.currentSites);
        });

        return connection;
    };

    const loadInitialState = async (hubs) => {
        setGlobalSpinState(true);
        props.setTimelineValues(createTimeline());

        for (const connection of hubs) {
            await connection.start();
        }

        await loadTechnician();
        await loadWorkOrders();
        await loadCompletedWorkOrdersBySelectedDate(props.date);

        setGlobalSpinState(false);
    };

    useEffect(() => {
        const connection = setupTechnicianHubConnection();
        const workOrderAssignConnection = setupAssignOrderConnection();
        props.setPageInfo(strings.PAGES.DISPATCH, pageNumbers.DISPATCH_PROCESS);

        loadInitialState([connection, workOrderAssignConnection]).then(_ => moveToCurrentTime());

        return () => {
            (async () => {
                await connection.stop();
                await workOrderAssignConnection.stop();

                props.clearPageState();
            })();
        }
    }, []);


    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    })

    const loadTechnician = async () => {
        try {
            const technicianResponse = await DispatchService.getTechnicians();
            const technicians = attachColors(technicianResponse.data.data);

            props.setTechnicians(technicians);
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_TECHNICIANS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    }

    const moveToCurrentTime = () => {
        const list = document.querySelector('.tech-virtual-list');
        const now = moment().utcOffset(DEFAULT_UTC_OFFSET);
        const pastTimeWidth = Math.ceil((now.hours() * MINUTES_IN_HOUR + now.minutes()) / TIMELINE_RESOLUTION_IN_FIFTEEN) * TIMELINE_RESOLUTION_IN_FIFTEEN;

        list.scrollLeft = (pastTimeWidth / TIMELINE_RESOLUTION_IN_FIFTEEN) * TIMELINE_CELL_WIDTH - SCROLL_OFFSET;
    }

    const loadWorkOrders = async () => {
        try {
            const workOrdersResponse = await DispatchService.getWorkOrders();

            const assignedWorkOrders = workOrdersResponse.data.data.filter(item => item.technicianId !== 0);

            props.setWorkOrders(workOrdersResponse.data.data);

            const assignWorkOrdersActionRequest = assignedWorkOrders.filter(item => !props.assignedWorkOrders.some(x => x.id == item.id)).map(item => {
                return {
                    id: item.id,
                    startAt: item.startAt,
                    technicianId: item.technicianId,
                    endAt: item.endAt
                }
            })

            props.assignWorkOrders(assignWorkOrdersActionRequest);
            props.submitWorkOrdersFiltering();
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const loadCompletedWorkOrdersBySelectedDate = async (date) => {
        try {
            const workOrdersByTimelineResponse = await DispatchService.getCompletedWorkOrdersBySelectedDate(getStartAt(date));
            const assignedWorkOrders = workOrdersByTimelineResponse.data.data;

            props.removeCompletedWorkOrders(assignedWorkOrders);

            const assignWorkOrdersActionRequest = assignedWorkOrders.map(item => {
                return {
                    id: item.id,
                    startAt: item.startAt,
                    technicianId: item.technicianId,
                    endAt: item.endAt
                }
            })

            props.assignWorkOrders(assignWorkOrdersActionRequest);
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.FETCH_COMPLETED_WORK_ORDERS_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const getStartAt = (selectedDate) => {
        selectedDate = moment(moment.tz(selectedDate, DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).format();
        return {
            selectedDate: selectedDate
        };
    }

    const assignWorkOrder = async (item, startDate, endAt, tech) => {
        props.changeLoadingState(true);

        try {
            if (item.updatedItem) {
                await DispatchService.changeWorkOrder({
                    dispatchRequestId: item.dispatchRequestId,
                    technicianId: tech.technicianId,
                    startAt: startDate,
                    endAt: endAt,
                    workOrderId: item.workOrderId,
                    actionType: actionTypesDispatchProcess.UPDATE
                });
            } else {
                await DispatchService.assignWorkOrder({
                    dispatchRequestId: item.dispatchRequestId,
                    technicianId: tech.technicianId,
                    startAt: startDate,
                    endAt: endAt,
                    workOrderId: item.workOrderId,
                    actionType: actionTypesDispatchProcess.ASSIGN
                });
            }
        }
        catch (error) {
            props.changeLoadingState(false);
            TrackingService.trackException(error);
            await loadWorkOrders();
            await loadCompletedWorkOrdersBySelectedDate();

            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_ASSIGN);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const unassignWorkOrder = async (dispatchRequestId, startAt, endAt, technicianId, orderId) => {
        props.changeLoadingState(true);
        try {
            await DispatchService.cancelWorkOrder({
                dispatchRequestId: dispatchRequestId,
                technicianId: technicianId,
                startAt: startAt,
                endAt: endAt,
                workOrderId: orderId,
                actionType: actionTypesDispatchProcess.CANCEL
            });
        }

        catch (error) {
            props.changeLoadingState(false);
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.UNABLE_TO_CANCEL);
            notification['error']({
                message: errorMessage,
            });
        }
    };

    const handleMovingToStartOfDay = () => {
        props.changeDate(1);

        setTimeout(() => {
            const list = document.querySelector('.tech-virtual-list');
            list.scrollLeft = 0;
        }, 30)
    }

    const handleMovingToOrder = (id) => {
        const assignedOrder = props.assignedWorkOrders.find(wo => wo.id == id);
        const startDate = assignedOrder.startAt.toUTCKind().convertToEST();
        props.setNewDate(startDate);
        const techIndex = props.technicians.indexOf(props.technicians.find(t => t.technicianId == assignedOrder.technician.technicianId));

        setIndexToScroll(techIndex);

        setTimeout(() => {
            const list = document.querySelector('.tech-virtual-list');
            const s = list.scrollWidth / (HOURS_IN_DAY / startDate.convertToEST().hours());
            list.scrollLeft = Math.abs(s);
        }, 30)
    }

    const renderWorkOrderBadge = (item) => {
        return (
            <WorkOrderBadge
                item={item}
                setScrollToIndex={setIndexToScroll}
                scrollRef={virtualList}
                handleMovingToOrder={handleMovingToOrder}
                selectedItem={props.assignedWorkOrders.find(wo => wo.id == item.id)}
                isSelected={
                    !!props.assignedWorkOrders &&
                    props.assignedWorkOrders.some(
                        (wo) => wo?.id == item.id
                    )
                }
            />
        );
    };

    const getFullTimeOrderPopover = (orders) => {
        return (
            orders.map(item => {
                return (
                    <div key={item.id} className="full-time-order-card" style={{ background: getOrderBadgeColor(item) }}>
                        <Popover overlayClassName="order-details-popover" content={orderDetailsPopover(item)} title={strings.COMMON.ORDER_DETAILS}>
                            <p>{item.workOrder.title}</p>
                        </Popover>
                        <TransportationChargePopover
                            assignedOrder={item}
                            changeLoadingState={props.changeLoadingState}
                        />
                        <Popconfirm title={strings.COMMON.UNASSIGN_ORDER} onConfirm={() => unassignWorkOrder(item.dispatchRequestId, item.startAt, item.endAt, item.technicianId, item.workOrderId)}>
                            <CloseOutlined style={{ color: item.statusId == workOrderStatuses.Opened && '#000 !important' }} />
                        </Popconfirm>
                    </div>
                )
            })
        )
    }

    const renderWorkOrderArea = (index, style, _isScrolling) => {
        const dndItems = [];
        const tech = props.technicians[index];
        const fullTimeOrders = props.assignedWorkOrders.filter(item => item.technician.fullName == tech.fullName && item.workOrder.isFullTimeWorkOrder);

        if (!(index >= loadedRows.startIndex && index <= loadedRows.stopIndex)) {
            return (
                <div className="timeline-placeholder" style={style} key={index}>
                    <div className="technician-block-placeholder">
                        <Skeleton.Input className="label-placeholder" active={true} />
                    </div>
                    <div className="area-placeholder">
                        <Skeleton.Input className="label-placeholder" active={true} />
                    </div>
                </div>
            )
        }

        timelineValues.forEach((element) => {

            const assignedWorkOrders = props.assignedWorkOrders.filter(item =>
                item.technician.fullName == tech.fullName &&
                moment.utc(item.startAt).utcOffset(DEFAULT_UTC_OFFSET).isSameOrBefore(moment.utc(element).utcOffset(DEFAULT_UTC_OFFSET)) &&
                moment.utc(item.endAt).utcOffset(DEFAULT_UTC_OFFSET).isAfter(moment.utc(element).utcOffset(DEFAULT_UTC_OFFSET)) &&
                !item.workOrder.isFullTimeWorkOrder
            );

            assignedWorkOrders.sort((a, b) => {
                return ('' + a.id).localeCompare(b.id);
            })

            dndItems.push(
                <WorkOrderDropArea
                    assignedOrders={props.assignedWorkOrders}
                    unassignOrder={unassignWorkOrder}
                    onDrop={assignWorkOrder}
                    assignedWorkOrder={assignedWorkOrders}
                    technician={tech}
                    timeValue={element}
                    timeline={timelineValues}
                    handleMovingToStartOfDay={handleMovingToStartOfDay}
                />
            );
        });

        return (
            <div className="timeline-row" style={{ ...style, width: 'fit-content' }} key={index}>
                <div className={`technician-block ${indexToScroll == index && 'highlight-tech'}`} >
                    <div className="tech-label">
                        <div className="identificator" style={{ background: tech.color }}></div>
                        <Popover
                            overlayClassName="tech-site-popover"
                            content={() => popoverContent(tech.technicianId)}
                            title={strings.COMMON.SITE_CHANGING_POPOVER}
                            trigger="click"
                            visible={tech.technicianId == popoverSite.id && popoverSite.visible}
                            onVisibleChange={(v) => handlePopoverVisible(v, tech.technicianId)}
                        >
                            <p>{tech.fullName}</p>
                        </Popover>
                    </div>
                    <div className="full-time-wrapper">
                        <Tooltip title={strings.COMMON.TECH_LOCATION}>
                            <LocationArrowSolid style={{ color: tech.color }} onClick={() => handleLocationMoving(tech.latitude, tech.longitude)} />
                        </Tooltip>
                        {fullTimeOrders.length !== 0 &&
                            (
                                <Popover
                                    overlayClassName="full-time-orders-popover"
                                    title={strings.COMMON.FULL_TIME_ORDERS}
                                    placement="rightTop"
                                    content={() => getFullTimeOrderPopover(fullTimeOrders)}
                                    trigger="click"
                                >
                                    <div className="full-time-orders">{`+${fullTimeOrders.length}`}</div>
                                </Popover>
                            )
                        }
                    </div>
                </div>
                <div className="work-order-drop-area">
                    {dndItems}
                </div>
            </div>
        );
    };

    const onDateCollapseChanged = (inputKeys) => {
        const updatedValue = inputKeys.map(item => {
            return {
                dateKey: item,
                isActive: true,
                activeProjectKeys: activeKeys.find(i => i.dateKey == item)?.activeProjectKeys
            }
        });

        setActiveKeys(updatedValue);
        LocalStorageService.setKeysData(updatedValue);
    };

    const onProjectCollapseChanged = (dateKey, inputKeys) => {
        const updatedValue = activeKeys.map(item => {
            if (item.dateKey == dateKey) {
                return {
                    ...item,
                    activeProjectKeys: inputKeys
                }
            }
            return item;
        })

        setActiveKeys(updatedValue);
        LocalStorageService.setKeysData(updatedValue);
    };

    const renderWorkOrders = () => {
        const unconfirmedWorkOrders = props.filteredWorkOrders.filter(item => !item.isConfirmed)
        const ordersByDay = groupBy(unconfirmedWorkOrders, item => item.workOrder?.startDate.toUTCKind().convertToEST("MMMM Do YYYY"));

        return (
            <Collapse activeKey={activeKeys.filter(item => item.isActive).map(item => item.dateKey)} onChange={onDateCollapseChanged}>
                {unconfirmedWorkOrders &&
                    Object.keys(ordersByDay).map((key) => {
                        const ordersByProject = (groupBy(ordersByDay[key], item => item.project.name));
                        const activeProjectKeys = activeKeys.find(item => item.dateKey == key)?.activeProjectKeys;
                        return (
                            <Panel header={key} key={key}>
                                <Collapse activeKey={activeProjectKeys ? activeProjectKeys : Object.keys(ordersByProject).map(k => k)} onChange={(k => onProjectCollapseChanged(key, k))}>
                                    {Object.keys(ordersByProject).map((k) => {
                                        return (
                                            <Panel header={k} key={k}>
                                                <List
                                                    key="id"
                                                    className="employees-list"
                                                    size="small"
                                                    dataSource={ordersByProject[k]}
                                                    renderItem={renderWorkOrderBadge}
                                                />
                                            </Panel>
                                        )
                                    })
                                    }
                                </Collapse>
                            </Panel>
                        );
                    })}
            </Collapse>
        );
    };

    const handleTimeChanging = (value) => {
        props.changeDate(value);
    }

    const handleLocationMoving = (lat, lon) => {
        if (!lat || !lon) {
            notification['warning']({
                message: strings.COMMON.NO_LOCATION,
            });
        } else {
            setCenterPosition([Number(lat), Number(lon)]);
            props.setCenterPosition([Number(lat), Number(lon)]);
            setZoomValue(17);
            props.setZoomValue(17);
        }
    }

    const handleMovingToCurrentTime = () => {
        const now = moment().convertToEST();
        props.setNewDate(now);

        moveToCurrentTime();
    }

    const handleSiteChanging = (values) => {
        const isSelect = values.length > props.currentSites.length;
        const diffObject = values.filter(e => !props.currentSites.includes(e))[0];
        const diffObjectName = props.allSites.find(item => item.id == diffObject)?.name;
        props.setCurrentSites(values);

        if (isSelect && diffObject) {
            const siteLocation = sitesLocations.find(item => item.siteName == diffObjectName)?.location;
            if (siteLocation) {
                setCenterPosition(siteLocation);
                props.setCenterPosition(siteLocation);
            } else if (diffObject == sites.RONE || diffObject == sites.JRB) {
                setCenterPosition(WACO_POSITION);
                props.setCenterPosition(WACO_POSITION);
            } else {
                notification['error']({
                    message: strings.COMMON.SITE_LOCATION_UNDEFINED,
                });
            }
            setZoomValue(11);
            props.setZoomValue(11);
        }
    }

    const handlePopoverVisible = (visible, id) => {
        setPopoverSite({ id: id, visible: visible });
    }

    const handleSitePopoverSubmit = async (id, prevSite) => {
        const digitValues = currentSelectedSite.map(item => Number(item));

        try {
            await UserManagement.editUserSites({ userId: id, siteIds: currentSelectedSite ? digitValues : [prevSite] })

            notification['success']({
                message: strings.COMMON.TECH_SITES_UPDATED
            });
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.EDIT_SITE_ERROR);
            notification['error']({
                message: errorMessage,
            });
        }
        setPopoverSite({ id: 0, visible: false });
    }

    const popoverContent = (id) => {
        const tech = props.technicians.find(item => item.technicianId == id);

        return (
            <>
                <CustomSingleOptionSelect mode="multiple" defaultValue={tech?.sites?.map(item => item.name)} handleChange={(_, option) => setCurrentSelectedSite(option.map(item => item.key))} options={siteOptionsWithoutAllOption} />
                <Popconfirm
                    placement="right"
                    title={strings.COMMON.NOTIFICATION_CONFIRM_UPDATE_TECH_SITES}
                    onConfirm={() => handleSitePopoverSubmit(tech.technicianId, tech.rootSiteId)}
                    okText={strings.COMMON.OK}
                    cancelText={strings.COMMON.CANCEL}
                >
                    <CustomBtn type="primary" name={strings.COMMON.SUBMIT} />
                </Popconfirm>
            </>
        )
    }

    const handleFullSizeModeOpen = () => {
        window.open(`${window.location.origin}${routes.FULL_SCREEN_MAP}`, '_blank', 'location=yes,height=700,width=700,scrollbars=yes,status=yes');
        setIsFullMap(true);
    }

    const handleTechnicianSearch = (value, _) => {
        const tech = props.technicians.find(item => item.fullName == value);
        setIndexToScroll(props.technicians.indexOf(tech));
        setIsLoadingState(true);
    }

    const handleReloadMap = () => {
        setCenterPosition(WACO_POSITION);
        setZoomValue(DEFAULT_ZOOM_VALUE);
        setIsFullMap(false);
        setIndexToScroll(DEFAULT_INDEX_TO_SCROLL);
    }

    const technicianFilterContent = (
        <FilterBySiteDropdown
            value={props.currentSites}
            isById={true}
            onChange={handleSiteChanging}
            withoutSearchButton={true}
        />
    )

    const ordersFilterContent = (
        <FilterBySiteDropdown
            value={props.filteredSites}
            isById={true}
            onChange={props.setFilteredSites}
            submit={props.submitWorkOrdersFiltering}
        />
    )

    return (
        <DndProvider backend={HTML5Backend}>
            {globalSpin &&
                <div className="dispatch-process-spin">
                    <Spin indicator={loadingIcon} />
                </div>
            }
            <div className="dispatch-process-layout"
                style={{ opacity: globalSpin ? '0' : '1' }}
            >
                <div className="work-orders-list">
                    <div className="unassigned-work-orders-header">
                        <HardHatSolid />
                        {strings.DISPATCH.LABELS.UNASSIGNED_ORDERS}
                        <Popover overlayClassName="filter-popover" placement="bottom" title={strings.COMMON.FILTER_ORDERS_BY_SITE} content={ordersFilterContent} trigger="click">
                            <FilterOutlined className="orders-site-filter-icon" />
                        </Popover>
                    </div>
                    {renderWorkOrders()}
                </div>
                <div className="main-layout">
                    {!isFullMap && (
                        <TechLocationMap setScrollToIndex={setIndexToScroll} />
                    )
                    }
                    <div className="dispatch-process-manage">
                        <div
                            className="date-header"
                            style={
                                isFullMap
                                    ? { border: "2px solid #fff" }
                                    : {}
                            }
                        >
                            <div className="filtering-wrapper">
                                <div className="site-selection">
                                    <Popover overlayClassName="filter-popover" placement="right" title={strings.COMMON.FILTER_TECHNICIAN_BY_SITE} content={technicianFilterContent} trigger="click">
                                        <FilterOutlined className="technician-site-filter-icon" />
                                    </Popover>
                                </div>
                                <div className="search-tech-autocomplete">
                                    <AutoComplete
                                        style={{ width: '100%' }}
                                        allowClear
                                        options={props.technicians.map(item => { return { value: item.fullName, key: item.id } })}
                                        placeholder={strings.COMMON.SEARCH_TECHNICIAN}
                                        filterOption={(inputValue, option) =>
                                            option.value.toUpperCase().startsWith(inputValue.toLocaleUpperCase())
                                        }
                                        onSelect={handleTechnicianSearch}
                                    />
                                </div>
                            </div>
                            <div className="date-changer">
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={() => handleTimeChanging(-1)}
                                />
                                <Popover content={<p className="calendar-format">{strings.DISPATCH.LABELS.CALENDAR}</p>}>
                                    <p>{`${props.date.toString().toUTCKind().convertToEST('MM / DD')}`}</p>
                                </Popover>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={() => handleTimeChanging(1)}
                                />
                            </div>
                            <div className="action-group">
                                <div className="reload-map-btn" onClick={handleReloadMap}>
                                    <Tooltip title={strings.COMMON.RELOAD_MAP}>
                                        <UndoOutlined />
                                    </Tooltip>
                                </div>
                                <Button
                                    className="week-btn"
                                    onClick={handleMovingToCurrentTime}
                                    style={{ borderRadius: '5px', borderWidth: '2px' }}
                                >
                                    {strings.DISPATCH.LABELS.NOW}
                                </Button>

                                <Button
                                    className="week-btn"
                                    onClick={() => setIsOpenPicker(prev => !prev)}
                                    style={{ borderRadius: '5px', borderWidth: '2px' }}
                                >
                                    {strings.DISPATCH.LABELS.WEEK}
                                </Button>
                                <DatePicker open={isOpenPicker} className="custom-date-picker" onChange={(value) => props.setNewDate(value)} />
                                {!isFullMap &&
                                    <Button
                                        className="full-view-btn"
                                        icon={<ExpandOutlined />}
                                        onClick={handleFullSizeModeOpen}
                                    >
                                        {strings.DISPATCH.LABELS.FULL_VIEW}
                                    </Button>
                                }
                            </div>
                        </div>
                        {(props.isLoading || isLoadingState == "true") &&
                            <Spin indicator={loadingIcon} style={dispatchSpinStyle} />
                        }
                        <div
                            className="timeline-wrapper"
                            style={{
                                height: isFullMap ? '83vh' : '30vh',
                                opacity: props.isLoading ? '0.5' : '1'
                            }}
                        >
                            <div className="assigned-dnd-area">
                                <div className="time-scale" style={{ display: 'flex', overflowX: 'hidden' }}>
                                    <div className="technical-header">
                                        {strings.DISPATCH.LABELS.TECHNICIAN}
                                        <Tooltip title={strings.COMMON.NOTIFICATION_MODAL}>
                                            <NotificationOutlined onClick={() => setNotificationIsModalVisible(true)} />
                                        </Tooltip>
                                    </div>
                                    <div className="timeline">
                                        {timelineValues &&
                                            timelineValues.length > 0 &&
                                            timelineValues.map((item, key) => {
                                                const timeSection = moment(item).utcOffset(DEFAULT_UTC_OFFSET);
                                                return (
                                                    <div
                                                        key={key}
                                                        className="timeline-block"
                                                        style={
                                                            isCurrentTime(timeSection)
                                                                ? {
                                                                    background: "#ff4444",
                                                                    color: "#fff",
                                                                }
                                                                : {}
                                                        }
                                                    >
                                                        {`${moment(item).utcOffset(DEFAULT_UTC_OFFSET).format('HH:mm')}`}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                                <VirtualList
                                    className="tech-virtual-list"
                                    height={isFullMap ? (windowHeight * 0.83) - 55 : (windowHeight * 0.3) - 55}
                                    overscanRowCount={2}
                                    onRowsRendered={(values) => setLoadedRows({
                                        startIndex: values.overscanStartIndex,
                                        stopIndex: values.overscanStopIndex
                                    })}
                                    rowCount={props.technicians.length}
                                    rowHeight={55}
                                    rowRenderer={({ index, isScrolling, _key, style }) => {
                                        return renderWorkOrderArea(index, style, isScrolling)
                                    }}
                                    scrollToIndex={Number(indexToScroll)}
                                    width={5600}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NotificationManagementModal
                isModalVisible={isNotificationModalVisible}
                handleCancel={() => setNotificationIsModalVisible(false)}
                handleOk={() => setNotificationIsModalVisible(false)}
            />
            <CustomDragLayer workOrders={props.workOrders} />
        </DndProvider >
    )
};

const mapState = ({ dispatchProcess, authorizedLayout }) => {
    return {
        technicians: dispatchProcess.currentSites.length ? dispatchProcess.filteredTechnicians : dispatchProcess.technicians,
        date: dispatchProcess.date,
        workOrders: dispatchProcess.unassignWorkOrders,
        filteredWorkOrders: dispatchProcess.filteredWorkOrders,
        assignedWorkOrders: dispatchProcess.assignedWorkOrders,
        hiddenTimelineBlocks: dispatchProcess.hiddenTimelineBlocks,
        timelineValues: dispatchProcess.timelineValues,
        isLoading: dispatchProcess.isLoading,
        allSites: authorizedLayout.allSites,
        currentSites: dispatchProcess.currentSites,
        isRegularMode: dispatchProcess.isRegularMode,
        zoomValue: dispatchProcess.zoomValue,
        centerPosition: dispatchProcess.centerPosition,
        zIndexValue: dispatchProcess.zIndexValue,
        filteredSites: dispatchProcess.filteredSites
    };
};

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName, pageKey) {
            dispatch(
                globalActions.setPageInfo({
                    name: pageName,
                    sidebarKey: [pageKey],
                })
            );
        },
        setFilteredSites(values) {
            dispatch(actions.setFilteredSites(values));
        },
        submitWorkOrdersFiltering() {
            dispatch(actions.submitWorkOrdersFiltering());
        },
        setCenterPosition(value) {
            dispatch(actions.setCenterPosition(value));
        },
        setLoading(value) {
            dispatch(actions.setLoading(value));
        },
        setRegularMode(value) {
            dispatch(actions.setRegularMode(value));
        },
        setZoomValue(value) {
            dispatch(actions.setZoomValue(value));
        },
        setZIndexValue(value) {
            dispatch(actions.setZIndexValue(value));
        },
        setTechnicians(values) {
            dispatch(actions.setTechnicians(values));
        },
        setWorkOrders(values) {
            dispatch(actions.setUnassignWorkOrders(values));
        },
        setTimelineValues(values) {
            dispatch(actions.setTimelineValues(values));
        },
        changeDate(value) {
            dispatch(actions.changeDate(value));
        },
        changeLoadingState(value) {
            dispatch(actions.changeLoadingState(value));
        },
        setNewDate(value) {
            dispatch(actions.setNewDate(value));
        },
        changeWorkOrder(id, startAt, technicianId, endAt, statusId, transportationChargeId) {
            dispatch(
                actions.changeWorkOrder({
                    id,
                    startAt,
                    technicianId,
                    endAt,
                    statusId,
                    transportationChargeId
                })
            );
        },
        setCurrentSites(values) {
            dispatch(actions.setCurrentSites(values));
        },
        assignWorkOrder(id, startAt, technicianId, endAt, statusId) {
            dispatch(
                actions.assignWorkOrder({
                    id,
                    startAt,
                    technicianId,
                    endAt,
                    statusId
                })
            );
        },
        assignWorkOrders(workOrders) {
            dispatch(actions.assignWorkOrders(workOrders))
        },
        unassignWorkOrder(id, statusId) {
            dispatch(actions.unassignWorkOrder({ id, statusId }));
        },
        sendWorkOrderNotification(values) {
            dispatch(actions.sendWorkOrderNotification(values));
        },
        confirmWorkOrders(values) {
            dispatch(actions.confirmWorkOrders(values));
        },
        completeWorkOrder(values) {
            dispatch(actions.completeWorkOrder(values));
        },
        clearPageState() {
            dispatch(actions.clearPageState());
        },
        removeCompletedWorkOrders(values) {
            dispatch(actions.removeCompletedWorkOrders(values));
        }
    };
};

export default connect(mapState, mapDispatch)(DispatchProcess);