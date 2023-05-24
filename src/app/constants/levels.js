const levelsProps = [
    {
        key: 'level1',
        value: 'level1',
        displayValue: 'Level 1',
        levelId: 1
    },
    {
        key: 'level2',
        value: 'level2',
        displayValue: 'Level 2',
        levelId: 2
    },
    {
        key: 'level3',
        value: 'level3',
        displayValue: 'Level 3',
        levelId: 3
    },
    {
        key: 'level4',
        value: 'level4',
        displayValue: 'Level 4',
        levelId: 4
    },
    {
        key: 'level5',
        value: 'level5',
        displayValue: 'Level 5',
        levelId: 5
    },
    {
        key: 'level6',
        value: 'level6',
        displayValue: 'Level 6',
        levelId: 6
    }
];

export const levelMapping = (level) => levelsProps.find(x => x.key === level).levelId;

export default levelsProps;