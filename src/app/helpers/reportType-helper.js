import { reportTypesIds } from "../constants";

export const isSoilMoistureDensityRelationshipReportType = (id) => {
    if (id == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP) {
        return true;
    } else {
        return false;
    }
}

export const isSoilReportType = (id) => {
    if (id == reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING ||
        id == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP ||
        id == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E) {
        return true;
    } else {
        return false;
    }
}

export const isConcreteCoreReportType = (id) => {
    if (id == reportTypesIds.CONCRETE_CORE) {
        return true;
    } else {
        return false;
    }
}

export const isConcreteCoreOrSoilReportType = (id) => {
    if (id == reportTypesIds.CONCRETE_CORE || isSoilReportType(id)) {
        return true;
    } else {
        return false;
    }
}

export const isConcreteReportType = (id) => {
    if (id == reportTypesIds.CONCRETE_CYLINDERS ||
        id == reportTypesIds.CONCRETE_BEAM_CENTER_POINT ||
        id == reportTypesIds.CONCRETE_GROUT ||
        id == reportTypesIds.CONCRETE_MORTAR ||
        id == reportTypesIds.CONCRETE_CORE ||
        id == reportTypesIds.CONCRETE_BEAM_THIRD_POINT ||
        id == reportTypesIds.CONCRETE_LIME_STABILIZED_DEPTH_CHECKS ||
        id == reportTypesIds.CONCRETE_FIREPROOFING_INSPECTION ||
        id == reportTypesIds.CONCRETE_FLOOR_FLATNESS_SURVEY) {
        return true;
    } else {
        return false;
    }
}

export const isCylindersBuildingConcreteType = (id) => (id == reportTypesIds.CONCRETE_CYLINDERS)

export const moistureDensityInitialValue = {
    dispatchRequestWorkOrderConcreteTests: [
        {
            "tests": [
                {
                    "specimenNo": 1
                }
            ]
        }
    ]
}