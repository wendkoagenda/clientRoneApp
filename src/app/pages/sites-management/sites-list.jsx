import React, { useEffect, useState } from 'react';
import { actions as globalActions } from '../../store/reducers/authorized-layout.reducer';
import { actions } from '../sites-management/sites-management-reducer';
import { connect } from 'react-redux';
import { strings } from '../../constants';
import { Table, Button, Tooltip, notification, Popconfirm, BackTop } from 'antd';
import { CustomBtn, TextCropCell } from '../../components/common';
import { getErrorMessage } from '../../services/tracking.service';
import { EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { SitesService, TrackingService } from '../../services';
import SiteManageModal from './site-manage.modal';


const SitesList = (props) => {
    const [isLoading, setLoading] = useState(false);

    const getSites = async () => {
        setLoading(true);
        try {
            const sitesResponse = await SitesService.searchByRequest(props.sitesSearchRequest);

            props.setSites(sitesResponse.data.data);
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.GET_SITES_ERROR);

            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);
        }

        setLoading(false);
    };

    useEffect(async () => {
        await getSites();

        props.setPageInfo(strings.PAGES.SITES_MANAGEMENT);
    }, [props.sitesSearchRequest]);

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter && sorter.column && sorter.column.dataIndex) {
            props.setSitesSearchRequestCriteria({
                sortCriteria: sorter.column.dataIndex,
                isAscend: sorter.order ? sorter.order === "ascend" : undefined
            });
        } else {
            props.setInitialSearchCriteria();
        }
    };

    const onManageSubmit = async (siteModel) => {
        setLoading(true);

        if (props.manageModalEditMode) {
            try {
                await SitesService.update(siteModel);

                notification['success']({
                    message: strings.COMMON.SITE_IS_UPDATED
                });

                await getSites();
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, strings.COMMON.UPDATE_SITE_ERROR);

                notification['error']({
                    message: errorMessage,
                });

                TrackingService.trackException(error);
            }
        } else {
            try {
                await SitesService.create(siteModel);

                notification['success']({
                    message: strings.COMMON.SITE_IS_CREATED
                });

                await getSites();
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, strings.COMMON.CREATE_SITE_ERROR);

                notification['error']({
                    message: errorMessage,
                });

                TrackingService.trackException(error);
            }
        }

        cancelAction();
        setLoading(false);
    };

    const onDelete = async (id) => {
        setLoading(true);
        try {
            await SitesService.delete(id);

            notification['success']({
                message: strings.COMMON.SITE_IS_DELETED
            });

            await getSites();
        }
        catch (error) {
            const errorMessage = getErrorMessage(error, strings.COMMON.DELETE_SITE_ERROR);

            notification['error']({
                message: errorMessage,
            });

            TrackingService.trackException(error);

            setLoading(false);
        }
    };

    const addNewSiteAction = () => {
        props.setManageModalEditMode(false);
        props.setEditSiteModel(null);
        props.setIsManageModalVisible(true);
    };

    const editSiteActions = (siteModel) => {
        props.setManageModalEditMode(true);
        props.setEditSiteModel(siteModel);
        props.setIsManageModalVisible(true);
    };

    const cancelAction = () => {
        props.setEditSiteModel(null);
        props.setIsManageModalVisible(false);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            sorter: true,
            onCell:(record) => {
                return {
                    onClick:() => editSiteActions(record)
                }
            },
            render: text => <div className="dispatch-info-col"><p className="col-text">{text}</p></div>
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '21%',
            sorter: true,
            onCell:(record) => {
                return {
                    onClick:() => editSiteActions(record)
                }
            },
            render: text => <div className="dispatch-info-col"><p className="col-text">{text}</p></div>
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            width: '20%',
            sorter: true,
            onCell:(record) => {
                return {
                    onClick:() => editSiteActions(record)
                }
            },
            render: text => <div className="dispatch-info-col"><p className="col-text">{text ? <TextCropCell inputString={text} title="Address" /> : strings.COMMON.NOT_SET}</p></div>
        },
        {
            title: 'Travel Charge',
            dataIndex: 'travelCharge',
            key: 'travelCharge',
            width: '15%',
            sorter: true,
            onCell:(record) => {
                return {
                    onClick:() => editSiteActions(record)
                }
            },
            render: text => <div className="dispatch-info-col"><p className="col-text">{text ? <TextCropCell inputString={text} title="Address" /> : strings.COMMON.NOT_SET}</p></div>
        },
        {
            key: 'action',
            width: '8%',
            render: (_, record) => {
                return (
                    <div className="table-actions">
                        <Popconfirm title="Are you sure want to delete current site?" onConfirm={() => onDelete(record.id)} okText={strings.COMMON.OK} cancelText={strings.COMMON.CANCEL}>
                            <Button icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                )
            },
        }
    ];

    return (
        <>
            <div className="reset-btn site-manage-action-buttons-group">
                <Tooltip placement="top" title={strings.SITE_MANAGEMENT_PAGE.CREATE_NEW_SITE_LABEL}>
                    <div className="add-new-site-button">
                        <CustomBtn icon={<EnvironmentOutlined style={{ fontSize: '18px' }} />} onClick={addNewSiteAction} type="primary" />
                    </div>
                </Tooltip>
            </div>
            <div className="journal-layout sites-layout">
                <Table
                    rowClassName={'custom-table-row'}
                    key="id"
                    rowKey="id"
                    columns={columns}
                    bordered={true}
                    loading={isLoading}
                    dataSource={props.sites}
                    pagination={false}
                    onChange={handleTableChange} />
            </div>
            <BackTop />
            <SiteManageModal
                title={props.manageModalEditMode ? strings.SITE_MANAGEMENT_PAGE.EDIT_SITE_LABEL : strings.SITE_MANAGEMENT_PAGE.CREATE_NEW_SITE_LABEL}
                site={props.editSiteModel}
                visible={props.manageModalVisible}
                onOk={onManageSubmit}
                onCancel={cancelAction} />
        </>
    )
}

const mapState = ({ authorizedLayout, sitesManagement }) => {
    return {
        allSites: authorizedLayout.allSites,
        sites: sitesManagement.sites,
        sitesSearchRequest: sitesManagement.sitesSearchRequest,
        manageModalVisible: sitesManagement.manageModalVisible,
        manageModalEditMode: sitesManagement.manageModalEditMode,
        editSiteModel: sitesManagement.editSiteModel
    };
}

const mapDispatch = (dispatch) => {
    return {
        setPageInfo(pageName) {
            dispatch(globalActions.setPageInfo({ name: pageName, sidebarKey: [] }));
        },
        setSites(sites) {
            dispatch(actions.setSites(sites));
        },
        setSitesSearchRequestCriteria(searchRequest) {
            dispatch(actions.setSitesSearchRequestCriteria(searchRequest));
        },
        setIsManageModalVisible(value) {
            dispatch(actions.setIsManageModalVisible(value));
        },
        setManageModalEditMode(value) {
            dispatch(actions.setManageModalEditMode(value));
        },
        setEditSiteModel(value) {
            dispatch(actions.setEditSiteModel(value));
        },
        setInitialSearchCriteria() {
            dispatch(actions.setInitialSearchCriteria());
        }
    }
}

export default connect(mapState, mapDispatch)(SitesList);