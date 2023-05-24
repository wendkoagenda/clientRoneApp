export const calculateMoistureContent = (wetMaterialPlusTare, dryMaterialPlusTare, tare) => {
    return Number((wetMaterialPlusTare - dryMaterialPlusTare) / (dryMaterialPlusTare - tare) * 100).toFixed(1);
}

export const calculateLiquidLimit = (moistureContent, numberOfBlows) => {
    return Number(moistureContent * Math.pow(numberOfBlows / 25, 0.121)).toFixed(1);
}

export const calculateAverageValue = (array) => {
    return Number(array.reduce((a, b) => a + b) / array.length).toFixed(0);
}

export const calculatePlasticLimit = (wetMaterialPlusTare, dryMaterialPlusTare, tare) => {
    return Number((wetMaterialPlusTare - dryMaterialPlusTare) / (dryMaterialPlusTare - tare) * 100).toFixed(0);
}

export const calculatePlasticityIndex = (averageLiquidLimit, plasticLimit) => {
    return Number(averageLiquidLimit - plasticLimit).toFixed(0);
}

export const calculatePercentPass = (wetMaterialPlusTare, dryMaterialPlusTare, tare) => {
    return Number((wetMaterialPlusTare - dryMaterialPlusTare) / (wetMaterialPlusTare - tare) * 100).toFixed(1);
}

export const calculateWaterAdded = (percentOfWaterAdded, materialMass) => {
    return Number(percentOfWaterAdded / 100 * materialMass).toFixed(1);
}

export const calculateAdmixtureMass = (materialMass, waterAdded) => {
    return Number(Number(materialMass) + Number(waterAdded)).toFixed(1);
}

export const calculateWetMaterial = (wetMaterialPlusTare, tare) => {
    return Number(wetMaterialPlusTare - tare).toFixed(1);
}

export const calculateWetDensityOfSpecimen = (wetMaterial, volumeConversionFactor) => {
    return Number(wetMaterial * volumeConversionFactor).toFixed(1);
}

export const calculateWater = (wetMaterialPlusTare, dryMaterialPlusTare) => {
    return Number(wetMaterialPlusTare - dryMaterialPlusTare).toFixed(1);
}

export const calculateDryMaterial = (dryMaterialPlusTare, tare) => {
    return Number(dryMaterialPlusTare - tare).toFixed(1);
}

export const calculateMoistureContentPercent = (water, dryMaterial) => {
    return Number(water / dryMaterial * 100).toFixed(1);
}

export const calculateMoistureContentPercentWithCorrection = (water, dryMaterial, percentageOf, percnetageOfMoisture) =>{
    percentageOf = percentageOf / 100;
    return Number(Number(water / dryMaterial * 100).toFixed(1) * (1 - percentageOf) + (percentageOf * percnetageOfMoisture)).toFixed(1);
}

export const calculateDryDensityPcf = (wetDensityOfSpecimen, moistureContentPercent) => {
    return Number(Number(wetDensityOfSpecimen) / (Number(moistureContentPercent) + 100) * 100).toFixed(1);
}

export const calculateDryDensityPcfWithCorrection = (wetDensityOfSpecimen, moistureContentPercent, percentageOf, specificGravity) => {
    let dryDensityWithoutCorrection = Number(Number(wetDensityOfSpecimen) / (Number(moistureContentPercent) + 100) * 100).toFixed(1);
    let densityOfWater = 62.42790878;
    percentageOf = percentageOf / 100;
    return Number(100/(((1 - percentageOf) / dryDensityWithoutCorrection) + (percentageOf / (densityOfWater * specificGravity))) / 100).toFixed(1);
}

export const calculateZeroVoidsPoint = (moistureContentPercent, specificGravity) => {
    var densityOfWater = 62.42790878;

    return Number((specificGravity * densityOfWater) / (1 + (moistureContentPercent * specificGravity / 100))).toFixed(1);
}