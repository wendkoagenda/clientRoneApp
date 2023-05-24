import React, { useEffect, useState } from 'react';
import { Col, DatePicker, Row, Switch, Tooltip, Form } from 'antd';
import { CloseCircleOutlined, NumberOutlined, SolutionOutlined, SwapRightOutlined, ExperimentOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { DEFAULT_WO_DURATION_IN_HOURS, disabledMinutes, getDefaultWoStartDate } from '../../../helpers/date-time-helper';
import TextCrop from '../../../components/common/text-crop';
import { strings } from '../../../constants';
import { MenuOutlined } from '@material-ui/icons';
import AddWorkOrderNotes from './add-work-order-notes';
import moment from 'moment';

const { RangePicker } = DatePicker;


const disableStyle = {
    color: 'rgb(220, 220, 220)',
    pointerEvents: 'none',
    background: 'inherit'
}

const WorkOrderCard = (props) => {
    const {
        orderId,
        isFullTime,
        orderType,
        handleFullTime,
        onRemove,
        onDateRangeChanged,
        startDate,
        endDate,
        isTestDisabled,
        isLaboratoryPresented,
        setTestsModal,
        isPickupJob,
        notes,
        createPickupRequest } = props;
    const defaultStartDate = getDefaultWoStartDate();

    const [IsNotesModalVisible, setNotesModalVisible] = useState(false);

    const [startDateValue, setStartDateValue] = useState(startDate);
    const [endDateValue, setEndDateValue] = useState(endDate);

    const handleStartDateChange = (value) => {
        onDateRangeChanged(orderId, [value, endDateValue]);
        setStartDateValue(value);
    }

    const handleEndDateChange = (value) => {
        onDateRangeChanged(orderId, [startDateValue, value]);
        setEndDateValue(value);
    }
    
    return (
        <div className="drop-card-style" style={{ background: '#dae9ff' }}>
            <Row>
                <Col span={2}>
                    {
                        !isPickupJob && (
                            <>
                                <NumberOutlined />
                                <p>{orderId}</p>
                            </>
                        )
                    }
                </Col>
                {
                    isLaboratoryPresented ? (
                        <Col span={1}>
                            <Tooltip title={strings.COMMON.SETUP_TESTS}>
                                <ExperimentOutlined style={isTestDisabled ? disableStyle : { cursor: 'pointer' }} onClick={() => setTestsModal(orderId)} />
                            </Tooltip>
                        </Col>
                    ) : (
                        <Col span={1}></Col>
                    )
                }
                <Col span={1}>
                    {
                        isPickupJob ? (
                            <VerticalAlignTopOutlined />
                        ) : (
                            <Tooltip title={strings.DISPATCH.LABELS.CREATE_PICKUP}>
                                <VerticalAlignBottomOutlined onClick={() => createPickupRequest(orderId)} />
                            </Tooltip>
                        )
                    }
                </Col>
                <Col span={7}>
                    <SolutionOutlined />
                    <p>{<TextCrop inputString={orderType} />}</p>
                </Col>
                <Col span={1}>
                    <Tooltip title={"Add notes"}>
                        <MenuOutlined onClick={() => setNotesModalVisible(true)} />
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Switch
                        defaultChecked={isFullTime}
                        checkedChildren={strings.COMMON.FULL_TIME_ORDER}
                        unCheckedChildren={strings.COMMON.FULL_TIME_ORDER}
                        onChange={(value) => handleFullTime(orderId, value)}
                    />
                </Col>
                <Col span={9}>
                    {!isFullTime && (
                        <div className="work-order-date-picker">
                            <DatePicker
                                style={{ width: '220px'}}
                                value={startDate?.toUTCKind().convertToEST()}
                                allowClear={false}
                                format={'MM-DD-YYYY HH:mm'}
                                defaultValue={defaultStartDate}
                                disabledMinutes={disabledMinutes}
                                className="start-date-picker"
                                showTime
                                showNow={false}
                                onChange={(value) => handleStartDateChange(value)}
                            />
                            <SwapRightOutlined />
                            <DatePicker
                                style={{ width: '220px'}}
                                value={endDate?.toUTCKind().convertToEST()}
                                allowClear={false}
                                defaultValue={defaultStartDate.add(DEFAULT_WO_DURATION_IN_HOURS, "hours")}
                                format={'MM-DD-YYYY HH:mm'}
                                disabledMinutes={disabledMinutes}
                                className="start-date-picker"
                                showTime
                                showNow={false}
                                onChange={(value) => handleEndDateChange(value)}
                            />
                        </div>
                    )}
                </Col>
                <Col span={1}>
                    <CloseCircleOutlined onClick={onRemove} />
                </Col>
            </Row>
            <AddWorkOrderNotes
                isModalVisible={IsNotesModalVisible}
                onClosed={() => setNotesModalVisible(false)}
                orderId={orderId}
                initialValue={notes}
                orderType={orderType}
            />
        </div>
    );
}

export default WorkOrderCard;