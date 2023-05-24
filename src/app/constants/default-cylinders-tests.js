/**
 * Represents default cylinder tests.
 * @readonly
 * @enum {{name: string, value: string}}
 */
const defaultCylinderSets = [
    {
        id:0,
        name: 'ASTM 4x8',
        specimens:[
            {
                setNumber:1,
                expectedResultDays:7
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:56
            },
        ]
    },
    {
        id:1,
        name: 'ASTM 6x12',
        specimens:[
            {
                setNumber:1,
                expectedResultDays:7
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:56
            },
        ]
    },
    {
        id:2,
        name: 'TXDOT',
        specimens:[
            {
                setNumber:1,
                expectedResultDays:7
            },
            {
                setNumber:1,
                expectedResultDays:7
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
            {
                setNumber:1,
                expectedResultDays:28
            },
        ]
    }
]

export default defaultCylinderSets;