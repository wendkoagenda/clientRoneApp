import React from 'react';
import { useDrop } from 'react-dnd';
import { strings } from '../../../constants';
import { Empty } from 'antd';
import ClientCard from '../client-card';

const ClientDropArea = (props) => {
    const { onDrop, clients, onRemove } = props;

    const [, drop] = useDrop(
        () => ({
            accept: 'client',
            drop: (item, monitor) => onDrop(item)
        }),
        []
    );

    return (
        <div ref={drop} className="client-drop-area">
            {
                (!!clients && !!clients.length) ? (
                    clients.map(cl => {
                        return (
                            <ClientCard changePrimaryClient={props.setPrimaryClientId} isPrimary={cl.id === props.primaryClientId} key={cl.id} client={cl} onRemove={onRemove} />
                        );
                    })
                ) : (
                    <div className="client-drop-text">
                        <Empty description={false} />
                        <span>{strings.PROJECTS.PROJECT_MANAGEMENT_FORM.LABELS.NO_CLIENT_ASSIGNED}</span>
                    </div>
                )
            }
        </div>
    );
}

export default ClientDropArea;