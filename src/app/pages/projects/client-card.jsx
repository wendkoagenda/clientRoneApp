import React from 'react';
import { Row, Col, Popover, Tooltip } from 'antd';
import { CloseCircleOutlined, UserOutlined, EnvironmentOutlined, FileDoneOutlined, FileOutlined } from '@ant-design/icons';
import { strings } from '../../constants';
import TextCrop from '../../components/common/text-crop';


const ClientCard = (props) => {
    const { client, onRemove, changePrimaryClient, isPrimary } = props;

    const addressPopover = (client) => {
        return (
            <div className="details-popover">
                <p>Address: <span>{client.address}</span></p>
                <p>City: <span>{client.city}</span></p>
                <p>ZIP: <span>{client.zipCode}</span></p>
                <p>Country: <span>{client.country}</span></p>
            </div>
        )
    }

    return (
        <div className="drop-card-style" style={{ background: '#dae9ff', marginBottom: '7px' }}>
            <Row>
                <Col span={8}>
                    <TextCrop icon={<UserOutlined />} title="Company" inputString={client.company} />
                </Col>
                <Col span={11}>
                    <EnvironmentOutlined />
                    <Popover content={() => addressPopover(client)}>
                        <p>{client.address}</p>
                    </Popover>
                </Col>
                <Col span={4}>
                    {
                        isPrimary ? (
                            <Tooltip placement="top" title={strings.PROJECTS.PRIMARY_CLIENT}>
                                <FileDoneOutlined />
                            </Tooltip>
                        ) : (
                            <Tooltip placement="top" title={strings.PROJECTS.MARK_CLIENT_AS_PRIMARY}>
                                <FileOutlined onClick={() => changePrimaryClient(client.id)} />
                            </Tooltip>
                        )
                    }
                </Col>
                <Col span={1}>
                    <CloseCircleOutlined onClick={() => onRemove(client.id)} />
                </Col>
            </Row>
        </div>
    );
}

export default ClientCard;