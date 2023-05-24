import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { actions as globalActions } from "../../store/reducers/authorized-layout.reducer";
import { actions } from "./dispatch-process-reducer";
import { MapContainer, TileLayer, Popup, Marker, LayersControl } from 'react-leaflet';
import { getIcon } from '../../components/icons/marker-icon';
import 'leaflet/dist/leaflet.css';
import useLocalStorage from 'react-use-localstorage';
import _useLocalStorage from '../../helpers/local-storage-helper';
import { attachColors, DEFAULT_ZOOM_VALUE, localStoragesValuesNames, WACO_POSITION } from '../../helpers/map-helper';
import TrackingService, { getErrorMessage } from '../../services/tracking.service';
import { notification } from 'antd';
import { DispatchService } from '../../services';
import { strings } from '../../constants';

const fullScreenStyle = {
    height: '100vh',
    margin: '0px -16px'
}

const singleScreenStyle = {
    height: '53vh'
}

const TechLocationMap = (props) => {
    const [map, setMap] = useState(null);

    const [isLoadingState, setIsLoadingState] = useLocalStorage(localStoragesValuesNames.IS_LOADING_STATE, false);
    const [isFullMap, setIsFullMap] = _useLocalStorage(localStoragesValuesNames.IS_FULL_MAP, false);
    const [centerPosition, setCenterPosition] = useLocalStorage(localStoragesValuesNames.CENTER_POSITION, WACO_POSITION);
    const [zoomValue, setZoomValue] = useLocalStorage(localStoragesValuesNames.ZOOM_VALUE, DEFAULT_ZOOM_VALUE);
    const [indexToScroll, setIndexToScroll] = useLocalStorage(localStoragesValuesNames.INDEX_TO_SCROLL, undefined);

    useEffect(() => {
        map?.setView(centerPosition.split(',').map(x => +x), Number(zoomValue));
    }, [centerPosition, isFullMap, zoomValue])

    useEffect(() => {
        map?.setView(props.centerPosition, props.zoomValue);
    }, [props.centerPosition, props.zoomValue])

    useEffect(() => {
        if (isFullMap) {
            window.onbeforeunload = () => {
                setIsFullMap(false);
            }
        } else {
            window.close();
        }
    }, [isFullMap])

    useEffect(async () => {
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
    }, [])

    return (
        <MapContainer center={WACO_POSITION} whenCreated={setMap} zoom={8} style={isFullMap ? fullScreenStyle : singleScreenStyle}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Road">
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satelite">
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg"
                    />
                </LayersControl.BaseLayer>
                {props.technicians.length &&
                    props.technicians.map((item, index) => {
                        const markerIcon = getIcon(item.color, item.vehicleNo);

                        if (item.latitude && item.longitude) {
                            return (
                                <Marker key={index} riseOnHover={true} style={{ zIndex: '100 !important' }} icon={markerIcon} position={[Number(item.latitude), Number(item.longitude)]} eventHandlers={{
                                    click: (e) => {
                                        const tech = props.technicians.find(item => (item.latitude == e.latlng.lat.toString() && item.longitude == e.latlng.lng.toString()));
                                        if (!isFullMap) {
                                            props.setScrollToIndex(props.technicians.indexOf(tech));
                                        } else {
                                            setIndexToScroll(props.technicians.indexOf(tech));
                                            setIsLoadingState(true);
                                        }
                                    }
                                }}>
                                    <Popup>
                                        <p style={{ fontSize: '15px', fontWeight: '600' }}>{item.fullName}</p>
                                    </Popup>
                                </Marker>
                            )
                        }
                    })
                }
            </LayersControl>
        </MapContainer>
    )
}

const mapState = ({ dispatchProcess }) => {
    return {
        technicians: dispatchProcess.currentSites.length ? dispatchProcess.filteredTechnicians : dispatchProcess.technicians,
        zoomValue: dispatchProcess.zoomValue,
        centerPosition: dispatchProcess.centerPosition,
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
        setCenterPosition(value) {
            dispatch(actions.setCenterPosition(value));
        },
        setZoomValue(value) {
            dispatch(actions.setZoomValue(value));
        },
        setTechnicians(values) {
            dispatch(actions.setTechnicians(values));
        },
    }
};

export default connect(mapState, mapDispatch)(TechLocationMap);