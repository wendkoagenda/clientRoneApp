export const calculateVolumeOfMaterial = (heightOfMaterial, volumeOfMold) => {
    return Number(heightOfMaterial * volumeOfMold).toFixed(6);
}

export const calculateWaterAdded = (totalPercentWater, materials) => {
    return Number(totalPercentWater * materials / 100).toFixed(2);
}

export const calculateWetDensity = (wetMaterial, volumeOfMaterial) => {
    return Number(Number(wetMaterial) / Number(volumeOfMaterial)).toFixed(6);
}

export const calculateWetMaterial = (wetMaterialPlusTare, tare) => {
    return Number(wetMaterialPlusTare - tare).toFixed(6);
}

export const calculateDryMaterialMass = (dryMassPanAndMaterial, panTareMass) => {
    return Number(dryMassPanAndMaterial - panTareMass).toFixed(6);
}

export const calculateWaterMass = (dryMassPanAndMaterial, panTareMass) => {
    return Number(dryMassPanAndMaterial - panTareMass).toFixed(6);
}

export const calculateDryDensityPcf = (wetDensity, moistureContentPercent) => {
    return Number((100 * wetDensity) / (100 + moistureContentPercent)).toFixed(2);
}