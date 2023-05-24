import React from 'react';
import {
    Row,
    Modal,
    Tooltip,
    Empty,
    Table
} from 'antd';
import { RightCircleOutlined } from '@ant-design/icons';
import TextCrop from '../../components/common/text-crop';
import moment from 'moment';
import { DEFAULT_UTC_OFFSET } from '../../helpers/timeline-helper';
import { strings } from '../../constants';
import { AddZerosToReportNumber } from '../../helpers/add-zeros-to-numbers';

const DispatchListModal = (props) => {
    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'clientCompany',
            key: 'name',
            render: text => <TextCrop icon={false} inputString={text} title="Company Name" />
        },
        {
            title: 'Report Number',
            dataIndex: 'reportNumber',
            key: 'report number',
            render: text => <TextCrop icon={false} inputString={AddZerosToReportNumber(text)} title="Report Number" />
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: text => <TextCrop icon={false} inputString={moment(text).utcOffset(DEFAULT_UTC_OFFSET).format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT)} title="date" />
        },
        {
            title: 'Work Order',
            dataIndex: ['workOrder', 'title'],
            key: 'work order',
            render: text => <TextCrop icon={false} inputString={text} title="Work Order" />
        },
        {
            title: 'Go to edit dispatch page',
            dataIndex: ['id'],
            key: 'icon',
            render: id => <Row justify="center"><Tooltip placement="right" title={"Go to edit dispatch page"}>
                <RightCircleOutlined onClick={() => props.onClick(id)} />
            </Tooltip>
            </Row>
        },
    ];

    return (
        <Modal
            title="Dispatch list, (assigned Business Party info displayed)"
            visible={props.visible}
            onCancel={props.onClose}
            width="80%"
            footer={false}
        >
            {
                !!props.dispatches.length
                    ? (
                        <Table
                            sticky
                            bordered
                            key="dispatchListItemId"
                            rowKey="dispatchListItemId"
                            rowClassName={'custom-table-row'}
                            scroll={{ x: '60vw' }}
                            columns={columns}
                            dataSource={props.dispatches}
                            pagination={{
                                pageSize: 200,
                                pageSizeOptions: [10, 20, 100, 150, 200],
                                showSizeChanger: true
                            }}
                        />
                    )
                    : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )
            }
        </Modal>
    );
}

export default DispatchListModal;