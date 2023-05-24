export const calculateExtraMetricTotal = (quantity, rate) => {
    return Number(quantity ? quantity : 0) * Number(rate ? rate : 0);
}

export const calculateArea = (diameter) => {
    return Number((Math.pow((diameter / 2), 2) * Math.PI).toFixed(2));
}

export const calculateCompressiveStrength = (maximumLoad, area) => {
    return Number(Math.round(maximumLoad / area / 10) * 10);
}

export const calculateDryDensity = (moisture, wetDensity) => {
    return Number((100 * wetDensity) / (100 + moisture)).toFixed(1);
}