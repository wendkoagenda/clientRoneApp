import L from 'leaflet';
import { associatedColors } from '../../constants';

const getIcon = (color, fullName) => {
    const markerHtmlStyles = `
        background: ${color};
        width: 2rem;
        height: 2rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        border-radius: 2.5rem 3rem 0;
        transform: rotate(45deg);
        border: 3px solid #FFFFFF;
        margin-left: 40px;
    `

    const labelStyle = `
        font-size: 16px;
        font-weight: 600;
        color: ${(color == associatedColors.HOUSTON || color == associatedColors.AUSTIN) ? '#00000' : '#fff'};
        margin-top: -5px;
        background: ${color};
        border-radius: 20px;
        width: max-content;
        border: 3px solid #FFFFFF;
        padding: 0px 10px 0px 10px;
        margin-top: -15px;
    `

    const blockStyle = `
        display: flex;
        flex-direction: column;
        align-items: center;
    `

    const markerIcon = L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `
        <div style="${blockStyle}">
            <span style="${markerHtmlStyles}" ></span>
            <p style="${labelStyle}">${fullName}</p>
        </div>`
    })

    return markerIcon;
}

export { getIcon };