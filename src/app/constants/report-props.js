import reportTypesIds from "./report-types";

// ExpectedResultDays
const BREAK_AGE = {
    name: 'Break Age',
    dataIndex: 'breakAge',
    sorterProp: 'expectedResultDays',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '5%'
};

// DateTested
export const BREAK_DATE = {
    name: 'Break Date',
    dataIndex: 'breakDate',
    sorterProp: 'dateTested',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    isDate: true,
    width: '7%'
};

const AGE_TESTED = {
    name: 'Age Tested',
    dataIndex: 'ageTested',
    sorterProp: 'ageTested',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '5%'
}

const SET_NUMBER = {
    name: 'Set Number',
    dataIndex: 'setNumber',
    sorterProp: 'setNumber',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '7%'
}

const DIAMETER = {
    name: 'Diameter',
    dataIndex: 'diameter',
    sorterProp: 'diameter',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '7%'
};

const AREA = {
    name: 'Area',
    dataIndex: 'area',
    sorterProp: 'area',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '7%'
};

const MAXIMUM_LOAD = {
    name: 'Maximum Load',
    dataIndex: 'maximumLoad',
    sorterProp: 'maximumLoad',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '10%'
};

const COMPRESSIVE_STRENGTH = {
    name: 'Compressive Strength',
    dataIndex: 'compressiveStrength',
    sorterProp: 'compressiveStrength',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '8%'
};

const FRACTURE = {
    name: 'Fracture Type',
    dataIndex: 'fractureType',
    sorterProp: 'fracture',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '10%'
};

const TESTED_BY = {
    name: 'Tested By',
    dataIndex: 'testedBy',
    sorterProp: 'testedBy',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '9%'
};

const MEASURED_SLUMP = {
    name: 'Measured Slump',
    dataIndex: 'measuredSlump',
    sorterProp: 'measuredSlump',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
};

const MODULUS_OF_RUPTURE = {
    name: 'Modulus of Rupture',
    dataIndex: 'modulusOfRupture',
    sorterProp: 'modulusOfRupture',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
};

const AVG_WIDTH = {
    name: 'AVG Width',
    dataIndex: 'avgWidth',
    sorterProp: 'avgWidth',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
};

const AVG_DEPTH = {
    name: 'AVG Depth',
    dataIndex: 'avgDepth',
    sorterProp: 'avgDepth',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
};

const CORE_LOCATION = {
    name: 'Core Location',
    dataIndex: 'coreLocation',
    sorterProp: 'coreLocation',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '10%'
};

const CORED_LENGTH = {
    name: 'Cored Length',
    dataIndex: 'coredLength',
    sorterProp: 'coredLength',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
};

const SAWED_LENGTH = {
    name: 'Sawed Length',
    dataIndex: 'sawedLength',
    sorterProp: 'sawedLength',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
};

const CAPPED_LENGTH = {
    name: 'Capped Length',
    dataIndex: 'cappedLength',
    sorterProp: 'cappedLength',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
};

const RATIO = {
    name: 'Ratio',
    dataIndex: 'ratio',
    sorterProp: 'ratio',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
};

const CORR_FACTOR = {
    name: 'Corr Factor',
    dataIndex: 'corrFactor',
    sorterProp: 'corrFactor',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
}

const MAX_DRY_DENSITY = {
    name: 'Maximum Dry Density',
    dataIndex: 'maximumDryDensity',
    sorterProp: 'maximumDryDensity',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '10%'
}

const OPTIMUM_MOISTURE_CONTENT = {
    name: 'Optimum Moisture Content',
    dataIndex: 'optimumMoistureContent',
    sorterProp: 'optimumMoistureContent',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '10%'
}

export const LIQUID_LIMIT = {
    name: 'Liquid Limit',
    dataIndex: 'liquidLimit',
    sorterProp: 'liquidLimit',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '7%'
}

export const PLASTIC_LIMIT = {
    name: 'Plastic Limit',
    dataIndex: 'plasticLimit',
    sorterProp: 'plasticLimit',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '7%'
}

export const PLASTICITY_INDEX = {
    name: 'Plasticity Index',
    dataIndex: 'plasticityIndex',
    sorterProp: 'plasticityIndex',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '7%'
}

export const PASSING = {
    name: 'Passing',
    dataIndex: 'passing',
    sorterProp: 'passing',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '8%'
}

const TEST_LOCATION_TITLE = {
    name: 'Test Location Title',
    dataIndex: 'testLocationTitle',
    sorterProp: 'testLocationTitle',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
}

const TEST_LOCATION_SUBTEXT = {
    name: 'Test Location Subtext',
    dataIndex: 'testLocationSubtext',
    sorterProp: 'testLocationSubtext',
    isFiltering: true,
    isEditable: true,
    isNumber: false,
    width: '5%'
}

const PROBE_DEPTH = {
    name: 'Probe Depth',
    dataIndex: 'probeDepth',
    sorterProp: 'probeDepth',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
}

const MOISTURE_DENSITY_REPORT = {
    name: 'Moisture Density Report',
    dataIndex: 'moistureDensityReport',
    sorterProp: 'moistureDensityReport',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
}

const MOISTURE = {
    name: 'Moisture',
    dataIndex: 'moisture',
    sorterProp: 'moisture',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
}

const WEB_DENSITY = {
    name: 'Wet Density',
    dataIndex: 'wetDensity',
    sorterProp: 'wetDensity',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '10%'
}

const DRY_DENSITY = {
    name: 'Dry Density',
    dataIndex: 'dryDensity',
    sorterProp: 'dryDensity',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '10%'
}

const DENSITY_MAX = {
    name: 'Density Max',
    dataIndex: 'densityMax',
    sorterProp: 'densityMax',
    isFiltering: true,
    isEditable: true,
    isNumber: true,
    width: '5%'
}

export const GRAPH_COORDINATES = {
    name: 'Graph Coordinates',
    dataIndex: 'graphCoordinates',
    sorterProp: 'graphCoordinates',
    isFiltering: false,
    isEditable: true,
    isNumber: true,
    width: '20%'
}

const SAMPLE_REPORT_NUMBER = {
    name: 'Sample/Report Number',
    dataIndex: 'sampleReportNumber',
    sorterProp: 'dispatchRequestWorkOrder.workOrderReport.id',
    isFiltering: false,
    isEditable: false,
    isNumber: true,
    width: '10%'
};

const PROJECT_NUMBER = {
    name: 'Project Number',
    dataIndex: 'projectNumber',
    sorterProp: 'dispatchRequestWorkOrder.dispatchRequest.project.number',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '10%'
};

const SITE = {
    name: 'Site',
    dataIndex: 'siteId',
    sorterProp: 'dispatchRequestWorkOrder.dispatchRequest.project.site.name',
    isFiltering: true,
    isEditable: false,
    isNumber: false,
    width: '8%'
};

const SPECIMEN_NUMBER = {
    name: 'Specimen Number',
    dataIndex: 'specimenNumber',
    sorterProp: 'specimenNumber',
    isFiltering: true,
    isEditable: false,
    isNumber: true,
    width: '7%'
}

export const WET_MATERIAL_TARE = {
    name: 'Wet material + tare',
    dataIndex: 'wetMaterialTare',
    sorterProp: 'wetTare',
    isEditable: true,
    isNumber: true,
    width: '8%'
}

export const DRY_MATERIAL_TARE = {
    name: 'Dry material + tare',
    dataIndex: 'dryMaterialTare',
    sorterProp: 'dryTare',
    isEditable: true,
    isNumber: true,
    width: '8%'
}

export const TARE = {
    name: 'Tare',
    dataIndex: 'tare',
    sorterProp: 'commonTare',
    isEditable: true,
    isNumber: true,
    width: '8%'
}

export const NO_OF_BLOWS = {
    name: 'No of blows',
    dataIndex: 'noOfBlows',
    sorterProp: 'noBlows',
    isEditable: true,
    isNumber: true,
    width: '8%'
}

const reportProps =
{
    [reportTypesIds.CONCRETE_CYLINDERS]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        BREAK_AGE,
        BREAK_DATE,
        DIAMETER,
        AREA,
        MAXIMUM_LOAD,
        FRACTURE,
        COMPRESSIVE_STRENGTH,
        TESTED_BY
    ],
    [reportTypesIds.CONCRETE_BEAM_CENTER_POINT]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        BREAK_AGE,
        BREAK_DATE,
        MEASURED_SLUMP,
        MAXIMUM_LOAD,
        MODULUS_OF_RUPTURE,
        AVG_WIDTH,
        AVG_DEPTH,
        TESTED_BY
    ],
    [reportTypesIds.CONCRETE_BEAM_THIRD_POINT]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        BREAK_AGE,
        BREAK_DATE,
        MEASURED_SLUMP,
        MAXIMUM_LOAD,
        MODULUS_OF_RUPTURE,
        AVG_WIDTH,
        AVG_DEPTH,
        TESTED_BY
    ],
    [reportTypesIds.CONCRETE_MORTAR]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        BREAK_AGE,
        BREAK_DATE,
        AGE_TESTED,
        MAXIMUM_LOAD,
        COMPRESSIVE_STRENGTH,
        TESTED_BY
    ],
    [reportTypesIds.CONCRETE_GROUT]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        BREAK_AGE,
        BREAK_DATE,
        MEASURED_SLUMP,
        AGE_TESTED,
        MAXIMUM_LOAD,
        COMPRESSIVE_STRENGTH,
        TESTED_BY
    ],
    [reportTypesIds.CONCRETE_CORE]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        SITE,
        CORE_LOCATION,
        CORED_LENGTH,
        SAWED_LENGTH,
        CAPPED_LENGTH,
        DIAMETER,
        AREA,
        RATIO,
        MAXIMUM_LOAD,
        CORR_FACTOR,
        COMPRESSIVE_STRENGTH,
        TESTED_BY
    ],
    [reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        MAX_DRY_DENSITY,
        OPTIMUM_MOISTURE_CONTENT,
        WET_MATERIAL_TARE,
        DRY_MATERIAL_TARE,
        TARE,
        NO_OF_BLOWS,
        LIQUID_LIMIT,
        PLASTIC_LIMIT,
        PLASTICITY_INDEX,
        PASSING,
        GRAPH_COORDINATES
    ],
    [reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        MAX_DRY_DENSITY,
        OPTIMUM_MOISTURE_CONTENT,
        WET_MATERIAL_TARE,
        DRY_MATERIAL_TARE,
        TARE,
        NO_OF_BLOWS,
        LIQUID_LIMIT,
        PLASTIC_LIMIT,
        PLASTICITY_INDEX,
        PASSING,
        GRAPH_COORDINATES
    ],
    [reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING]: [
        SAMPLE_REPORT_NUMBER,
        PROJECT_NUMBER,
        SET_NUMBER,
        SPECIMEN_NUMBER,
        TEST_LOCATION_TITLE,
        TEST_LOCATION_SUBTEXT,
        PROBE_DEPTH,
        MOISTURE_DENSITY_REPORT,
        MOISTURE,
        WEB_DENSITY,
        DRY_DENSITY,
        DENSITY_MAX
    ]
};

export default reportProps;