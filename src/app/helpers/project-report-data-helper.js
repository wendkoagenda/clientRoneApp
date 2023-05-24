import { reportTypesIds } from "../constants";
import { getTimeFromDate } from "./date-time-helper";

export const populateCustomReportDataProperties = (parsedData) => {
    if (parsedData.projectSections && parsedData.projectSections.length) {
        return {
            ...parsedData,
            projectSections: parsedData.projectSections.map(projectSection => {
                if (projectSection.waterAdded) {
                    return {
                        ...projectSection,
                        sampleTime: getTimeFromDate(projectSection.sampleTime),
                        batchTime: getTimeFromDate(projectSection.batchTime),
                        remarks: `${projectSection.waterAdded} gallons of water added. ${projectSection.remarks}`,
                        waterAdded: null // TODO: the idea is to remove waterAdded property from the model in cases if it's already merged with the remarks property
                    }
                }

                else {
                    return {
                        ...projectSection,
                        sampleTime: getTimeFromDate(projectSection.sampleTime),
                        batchTime: getTimeFromDate(projectSection.batchTime),
                    }
                }
            })
        }
    }

    return parsedData;
};

export const handleInjectedScripts = (reportTypeId) => {
    if (reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP ||
        reportTypeId == reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E) {
        const scripts = document.getElementById("soil-test-chart-builder")?.innerText;
        if (scripts) {
            eval(scripts);
        }
    }
};