import React from 'react';
import { useDrop } from 'react-dnd';
import { Row, Col, Empty } from 'antd';
import {
    CloseCircleOutlined,
    UserOutlined,
    CompassOutlined
} from '@ant-design/icons';
import { strings } from '../../../constants';
import { TextCrop } from '../../../components/common';

const ProjectsDropArea = (props) => {
    const {
        onDrop,
        onRemove,
        projects,
    } = props;

    const [, drop] = useDrop(
        () => ({
            accept: 'project',
            drop: (item, _monitor) => onDrop(item)
        }),
        []
    );

    const titleColStyle = { fontSize: '16px' };

    return (
        <div ref={drop} className="projects-drop-area">
            {
                (!!projects && !!projects.length) ? (
                    projects.map(pr => {
                        return (
                            <div key={pr.id} className="drop-card-style">
                                <Row>
                                    <Col span={10}>
                                        <UserOutlined style={titleColStyle}/>
                                        <TextCrop style={titleColStyle} inputString={pr.name} title="name" />
                                    </Col>
                                    <Col span={7}>
                                        <CompassOutlined />
                                        <TextCrop style={titleColStyle} inputString={pr.address} title="address" />
                                    </Col>
                                    <Col span={5}>
                                        <TextCrop style={titleColStyle} inputString={pr.site.name} title="site" />
                                    </Col>
                                    <Col span={1}>
                                        <CloseCircleOutlined onClick={() => onRemove(pr.id)} />
                                    </Col>
                                </Row>
                            </div>
                        );
                    })
                ) : (
                    <div>
                        <Empty description={false} />
                        <p  style={{ textAlign: 'center' }}>{strings.CUSTOMER_PORTAL.NO_PROJECTS_ASSIGNED}</p>
                    </div>
                )
            }
        </div>
    );
}

export default ProjectsDropArea;