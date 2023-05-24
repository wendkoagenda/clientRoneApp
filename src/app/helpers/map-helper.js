import { associatedColors } from "../constants";

export const mapTiler = (x, y, z, dpr) => {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}.jpg`;
}

export const attachColors = (techs) => {
    return techs.map((item) => {
        switch (item.rootSiteId) {
            case 1:
                item.color = associatedColors.AUSTIN;
                break;
            case 2:
                item.color = associatedColors.DALLAS;
                break;
            case 3:
                item.color = associatedColors.FORT_WORTH;
                break;
            case 4:
                item.color = associatedColors.HOUSTON;
                break;

            default:
                item.color = associatedColors.DEFAULT;
                break;
        }

        return item;
    });
}

export const WACO_POSITION = [31.559814, -97.141800];
export const DEFAULT_ZOOM_VALUE = 8;
export const DEFAULT_INDEX_TO_SCROLL = 1;

export const localStoragesValuesNames = {
    IS_LOADING_STATE: 'isLoadingState',
    CENTER_POSITION: 'centerPosition',
    ZOOM_VALUE: 'zoomValue',
    IS_FULL_MAP: 'isFullMap',
    INDEX_TO_SCROLL: 'indexToScroll'
}
