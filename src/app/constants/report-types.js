/**
 * Enum for work order status.
 * @readonly
 * @enum {{name: string, hex: number}}
 */
const reportTypesIds = {
    UNDEFINED: 0,
    CONCRETE_CYLINDERS: 1,
    CONCRETE_BEAM_CENTER_POINT: 2,
    CONCRETE_GROUT: 3,
    CONCRETE_MORTAR: 4,
    CONCRETE_CORE: 5,
    CONCRETE_BEAM_THIRD_POINT: 6,
    SOIL_MOISTURE_DENSITY_RELATIONSHIP: 7,
    SOIL_IN_PLACE_DENSITY_TESTING: 8,
    CONCRETE_LIME_STABILIZED_DEPTH_CHECKS: 9,
    CONCRETE_FIREPROOFING_INSPECTION: 10,
    CONCRETE_FLOOR_FLATNESS_SURVEY: 11,
    CONCRETE_PULVERIZATION_GRADATION: 15,
    CONCRETE_REINFORCING_STEEL: 16,
    CONCRETE_POST_TENSION_INSPECTION: 20,
    GENERIC_FIXTURE: 21,
    SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E: 22
};

export const concreteReportTypeIds = {
    CONCRETE_CYLINDERS: 1,
    CONCRETE_BEAM_CENTER_POINT: 2,
    CONCRETE_GROUT: 3,
    CONCRETE_MORTAR: 4,
    CONCRETE_CORE: 5,
    CONCRETE_BEAM_THIRD_POINT: 6,
    CONCRETE_LIME_STABILIZED_DEPTH_CHECKS: 9,
    CONCRETE_FIREPROOFING_INSPECTION: 10,
    CONCRETE_FLOOR_FLATNESS_SURVEY: 11,
    GENERIC_FIXTURE: 21,
}

export const breakListReportTypesIds = [
    reportTypesIds.UNDEFINED,
    reportTypesIds.CONCRETE_CYLINDERS,
    reportTypesIds.CONCRETE_BEAM_CENTER_POINT,
    reportTypesIds.CONCRETE_GROUT,
    reportTypesIds.CONCRETE_MORTAR,
    reportTypesIds.CONCRETE_CORE,
    reportTypesIds.CONCRETE_BEAM_THIRD_POINT,
    reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP,
    reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING,
    reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E
];

export const reportTypesGroup = {
    CONCRETE: 'Concrete',
    SOIL: 'Soil'
}

export const reportTypes = [
    {
        reportTypeId: reportTypesIds.CONCRETE_CYLINDERS,
        reportName: 'Concrete Cylinders',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_BEAM_CENTER_POINT,
        reportName: 'Concrete Beam (Center Point)',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_BEAM_THIRD_POINT,
        reportName: 'Concrete Beam (Third Point)',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_GROUT,
        reportName: 'Concrete Grout',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_MORTAR,
        reportName: 'Concrete Mortar',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_CORE,
        reportName: 'Concrete Core',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP,
        reportName: 'Soil Moisture Density Relationship (ASTM D698 - Standard Proctor)',
        reportTypeGroup: reportTypesGroup.SOIL
    },
    {
        reportTypeId: reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E,
        reportName: 'Soil Moisture Density Relationship (Tex113E)',
        reportTypeGroup: reportTypesGroup.SOIL
    },
    {
        reportTypeId: reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING,
        reportName: 'Soil In Place Density Testing',
        reportTypeGroup: reportTypesGroup.SOIL
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_LIME_STABILIZED_DEPTH_CHECKS,
        reportName: 'Concrete Lime Stabilized Depth Checks',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_FIREPROOFING_INSPECTION,
        reportName: 'Concrete Fireproofing Inspection',
        reportTypeGroup: reportTypesGroup.CONCRETE
    },
    {
        reportTypeId: reportTypesIds.CONCRETE_FLOOR_FLATNESS_SURVEY,
        reportName: 'Concrete Floor Flatness Survey',
        reportTypeGroup: reportTypesGroup.CONCRETE
    }
]

export default reportTypesIds;