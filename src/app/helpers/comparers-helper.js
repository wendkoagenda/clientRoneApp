const getValueByDataIndex = (dataIndex, record) => {
    if (dataIndex.includes('.')) {
        const properties = dataIndex.split('.');
        let value = record[properties[0]];

        for (let index = 1; index < properties.length; index++) {
            const key = properties[index];

            if (!value) {
                value = '';
            } else {
                value = value[key];
            }
        }

        return value;
    }

    return record[dataIndex];
};

const compareNumbers = (a, b) => a - b;

const compareDates = (a, b) => {
    a = moment(a);
    b = moment(b);

    return a.diff(b);
};

/**
 * Comparator for antd string columns
 * @returns {Number} comparison value
 * @param dataIndex
 */
export const compareAntdTableNumbers = dataIndex => {
    return (a, b) => {
        const firstNumber = getValueByDataIndex(dataIndex, a);
        const secondNumber = getValueByDataIndex(dataIndex, b);

        return compareNumbers(firstNumber, secondNumber);
    };
};

/**
 * Comparator for antd number columns
 * @returns {Number} comparison value
 * @param dataIndex
 */
export const compareAntdTableStrings = dataIndex => {
    return (a, b) => {
        const firstString = getValueByDataIndex(dataIndex, a);
        const secondString = getValueByDataIndex(dataIndex, b);

        return firstString.localeCompare(secondString);
    };
};

/**
 * Comparator for antd date columns
 * @returns {Number} comparison value
 * @param dataIndex
 */
export const compareAntdTableDates = dataIndex => {
    return (a, b) => {
        const firstDate = getValueByDataIndex(dataIndex, a);
        const secondDate = getValueByDataIndex(dataIndex, b);

        return compareDates(firstDate, secondDate);
    };
};

/**
 * Comparator for antd arrays of string columns
 * @returns {String} comparison value
 * @param dataIndex
 */
export const compareArraysOfString = dataIndex => {
    return (a, b) => {
        const firstString = getValueByDataIndex(dataIndex, a);
        const secondString = getValueByDataIndex(dataIndex, b);

        return firstString.toString().localeCompare(secondString.toString());
    };
};

/**
 * Comparator for antd arrays columns by string property
 * @returns {String} comparison value
 * @param arrayItemProperty
 */
export const compareArraysByStringProperty = (dataIndex, arrayItemProperty) => {
    return (a, b) => {
        const firstRecord = getValueByDataIndex(dataIndex, a);
        const secondRecord = getValueByDataIndex(dataIndex, b);

        const firstString = firstRecord.map(item => getValueByDataIndex(arrayItemProperty, item));
        const secondString = secondRecord.map(item => getValueByDataIndex(arrayItemProperty, item));

        return firstString.toString().localeCompare(secondString.toString());
    };
};

/**
 * Comparator for antd arrays of string columns
 * @returns {Boolean} comparison value
 * @param dataIndex
 */
export const compareAntdTableBooleans = dataIndex => {
    return (a, b) => {
        const firstValue = getValueByDataIndex(dataIndex, a);
        const secondValue = getValueByDataIndex(dataIndex, b);

        return (firstValue === secondValue) ? 0 : firstValue ? -1 : 1;
    };
};