import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Modal, Checkbox, Popconfirm, Tabs, List, notification, DatePicker } from 'antd';
import { strings, workOrderStatuses } from "../../constants";
import { CustomBtn, SearchInput } from "../../components/common";
import { SearchOutlined } from "@ant-design/icons";
import { nestedSearch } from "../../helpers/search-helper";
import { actions } from "./dispatch-process-reducer";
import { DispatchService, TrackingService } from "../../services";
import moment from "moment";
import {
    RightOutlined,
    LeftOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { getErrorMessage } from "../../services/tracking.service";
import { formatNotificationManagementDate } from "../../helpers/date-time-helper";

const { TabPane } = Tabs;
const { confirm } = Modal;

const NotificationManagementModal = (props) => {
    const [currentDate, setCurrentDate] = useState(moment().utc().format().toUTCKind().format());
    const [checkedValues, setCheckedValues] = useState([]);
    const [openedWorkOrders, setOpenedWorkOrders] = useState([]);
    const [inProgressWorkOrders, setInProgressWorkOrders] = useState([]);
    const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
    const [filteredInProgressWorkOrders, setFilteredInProgressWorkOrders] = useState([]);
    const [currentTabPane, setCurrentTabPane] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
    const [openedWorkOrdersByDate, setOpenedWorkOrdersByDate] = useState([]);

    const { isModalVisible, handleCancel, handleOk, onOk } = props;

    const handleCheckboxClick = (values) => {
        setCheckedValues(values);
    }

    const handleAllSelectedOptions = (event) => {
        if (event.target.checked == true) {
            setCheckedValues(openedWorkOrders.map(item => item.id));
        }
        else {
            setCheckedValues([]);
        }
    }

    const handleOrdersSearch = (searchString) => {
        setFilteredWorkOrders(nestedSearch(searchString, openedWorkOrders));
        setFilteredInProgressWorkOrders(nestedSearch(searchString, inProgressWorkOrders));
    }

    const handleDatePickerChange = async (value) => {
        var workOrderStartRange = formatNotificationManagementDate(value);
        var workOrderEndRange = formatNotificationManagementDate(moment(value).add(1, 'days'));
        setOpenedWorkOrdersByDate(props.assignedWorkOrders.filter(item => item.statusId == workOrderStatuses.Opened && item.startAt >= workOrderStartRange && item.startAt <= workOrderEndRange));
        setCheckedValues(openedWorkOrdersByDate.map(item => item.id));
        confirm({
            title: strings.COMMON.NOTIFICATION_CONFIRM,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                return SubmitByDatePicker();
            },
            onCancel() {
                setCheckedValues([]);
                return null;
            },
        });
    }

    const SubmitByDatePicker = async () => {
        setIsLoading(true);
        try {
            let promises = openedWorkOrdersByDate.map(item => sendNotification(item));

            const result = await Promise.all(promises);
            result.forEach(res => props.sendWorkOrderNotification(res.data.data));
        } catch (_error) {
            // ignore
        }

        setIsLoading(false);
    }

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let notificationWorkOrders = props.assignedWorkOrders.filter(item => checkedValues.includes(item.id));

            let promises = notificationWorkOrders.map(item => sendNotification(item));

            const result = await Promise.all(promises);
            result.forEach(res => props.sendWorkOrderNotification(res.data.data));
        } catch (_error) {
            // ignore
        }

        setIsLoading(false);
    }

    const sendNotification = async (item) => {
        try {

            let result = await DispatchService.sendNotification({
                dispatchRequestId: item.dispatchRequestId,
                workOrderId: item.workOrderId
            });

            return result;
        } catch (error) {
            TrackingService.trackException(error);

            const errorMessage = getErrorMessage(error, strings.COMMON.NOTIFICATION_SENDING_ERROR);
            notification['error']({
                message: errorMessage,
            });

            return undefined;
        }
    }

    const handleCurrentOrders = () => {
        const openedOrders = props.assignedWorkOrders.filter(item => item.statusId == workOrderStatuses.Opened);
        const inProgressOrders = props.assignedWorkOrders.filter(item => item.statusId == workOrderStatuses.InProgress);

        const filteredInProgressOrders = inProgressOrders.filter(item => {
            const esDate = item.startAt.toUTCKind().convertToEST();

            return (esDate.isSame(currentDate.toUTCKind(), 'day'));
        });

        setInProgressWorkOrders(inProgressOrders);
        setOpenedWorkOrders(openedOrders);
        setFilteredInProgressWorkOrders(filteredInProgressOrders);
        setFilteredWorkOrders(openedOrders);
    }

    useEffect(() => {
        handleCurrentOrders();
    }, [props.assignedWorkOrders])

    useEffect(() => {
        handleCurrentOrders();
    }, [currentDate])

    const handleDateChange = (value) => {
        const newDate = currentDate.toUTCKind();
        newDate.add('days', value);
        setCurrentDate(newDate.format());
    }

    const renderOpenedOrder = (item) => {
        return (
            <div className="technician-block notification-block" key={[item.technicianId, item.dispatchRequestId, item.workOrderId]}>
                <div style={{ display: 'inherit', alignItems: 'center' }}>
                    <div className="identificator" style={{ background: item.technician.color }}></div>
                    <p>{item.technician.fullName}</p>
                    <p style={{ marginLeft: '16px' }}>{`WO - #${item.workOrder.id}`}</p>
                </div>
                <Checkbox key={[item.dispatchRequestId, item.workOrderId]} value={item.id} />
            </div>
        );
    }

    const renderInProgressOrder = (item) => {
        return (
            <div className="technician-block notification-block" key={[item.technicianId, item.dispatchRequestId, item.workOrderId]}>
                <div style={{ display: 'inherit', alignItems: 'center' }}>
                    <div className="identificator" style={{ background: item.technician.color }}></div>
                    <p>{item.technician.fullName}</p>
                    <p style={{ marginLeft: '16px' }}>{`WO - #${item.workOrder.id}`}</p>
                </div>
                <p style={{ color: '#ff6347' }}>{strings.COMMON.NOTIFICATION_SENT}</p>
            </div>
        );
    }

    const footerElement = (
        <div className="notification-footer">
            {
                currentTabPane == 1 &&
                <CustomBtn
                    type="primary"
                    style={{ left: '-265px' }}
                    onClick={() => setIsOpenDatePicker(true)}
                    name={strings.COMMON.SUBMIT_BY_DATE_PICKER}
                    icon={<DatePicker
                        className="custom-date-picker"
                        open={isOpenDatePicker}
                        onChange={(value) => handleDatePickerChange(value)}
                        onOk={onOk}
                        onOpenChange={() => setIsOpenDatePicker(false)}
                    />}
                />
            }
            {
                currentTabPane == 2 && (
                    <div className="notification-date-changer">
                        <LeftOutlined onClick={() => handleDateChange(-1)} />
                        <p>{currentDate.toUTCKind().format('MM / DD')}</p>
                        <RightOutlined onClick={() => handleDateChange(1)} />
                    </div>
                )
            }
            <Popconfirm
                placement="bottom"
                title={strings.COMMON.NOTIFICATION_CONFIRM}
                onConfirm={handleSubmit}
                okText={strings.COMMON.OK}
                cancelText={strings.COMMON.CANCEL}
            >
                <CustomBtn type="primary" name={strings.COMMON.SUBMIT} />
            </Popconfirm>
        </div>
    );

    return (
        <Modal
            title={strings.COMMON.NOTIFICATION_MODAL}
            wrapClassName="notification-modal"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[footerElement]}
        >
            <div className="technician-block notification-block notification-all" style={{ borderBottom: '0px' }}>
                <SearchInput
                    style={{ marginBottom: '15px' }}
                    placeholder={strings.COMMON.SEARCH_TECHNICIAN}
                    onChange={e => handleOrdersSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                />
                {currentTabPane != "2" &&
                    <div style={{ display: 'inherit', justifyContent: 'flex-end' }}>
                        <p>{strings.COMMON.SELECT_ALL_LABEL}</p>
                        <Checkbox onChange={handleAllSelectedOptions} />
                    </div>
                }
            </div>
            <Tabs className="technicians-notification-tabs" activeKey={currentTabPane} type="card" onChange={(key) => setCurrentTabPane(key)}>
                <TabPane tab={strings.COMMON.NOT_SUBMITTED} key="1">
                    <Checkbox.Group style={{ width: '100%' }} value={checkedValues} onChange={handleCheckboxClick}>
                        <List
                            loading={isLoading}
                            dataSource={filteredWorkOrders}
                            pagination={{
                                pageSize: 200,
                            }}
                            renderItem={renderOpenedOrder}
                        />
                    </Checkbox.Group>
                </TabPane>
                <TabPane tab={strings.COMMON.SUBMITTED} key="2">
                    <List
                        style={{ marginBottom: '6px' }}
                        dataSource={filteredInProgressWorkOrders}
                        pagination={{
                            pageSize: 200,
                        }}
                        renderItem={renderInProgressOrder}
                    />
                </TabPane>
            </Tabs>
        </Modal>
    )
}

const mapState = ({ dispatchProcess }) => {
    return {
        assignedWorkOrders: dispatchProcess.assignedWorkOrders,
    };
};

const mapDispatch = (dispatch) => {
    return {
        sendWorkOrderNotification(values) {
            dispatch(actions.sendWorkOrderNotification(values));
        }
    }
};

export default connect(mapState, mapDispatch)(NotificationManagementModal);