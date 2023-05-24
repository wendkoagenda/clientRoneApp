export const adminTypesProps = {
    RATE: [
        'rateLevel1',
        'rateLevel2',
        'rateLevel3',
        'rateLevel4',
        'rateLevel5',
        'rateLevel6',
    ],
    MINIMUM: [
        'minimumAdminTimeLevel1',
        'minimumAdminTimeLevel2',
        'minimumAdminTimeLevel3',
        'minimumAdminTimeLevel4',
        'minimumAdminTimeLevel5',
        'minimumAdminTimeLevel6'
    ],
    INCREMENT: [
        'incrementLevel1',
        'incrementLevel2',
        'incrementLevel3',
        'incrementLevel4',
        'incrementLevel5',
        'incrementLevel6'
    ]
};

export const adminTimeCalculationTypesDescription = {
    Sets: 1,
    Specimens: 2,
    Report: 3
};

export const adminTimeCalculationTypes = [
    {
        id: adminTimeCalculationTypesDescription.Sets,
        value: 'Sets'
    },
    {
        id: adminTimeCalculationTypesDescription.Specimens,
        value: 'Specimens'
    },
    {
        id: adminTimeCalculationTypesDescription.Report,
        value: 'Report'
    }
];