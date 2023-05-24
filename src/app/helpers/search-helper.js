export const nestedSearch = (searchString, inputArray) => {
    return inputArray.filter(item => getFilteredObject(searchString, item));
};

export const searchWorkOrders = (searchString, workOrders) => {
    let result = {};

    Object.keys(workOrders).forEach(category => {
        const categoryResult = nestedSearch(searchString, workOrders[category]);
        if (categoryResult.length) {
            result[category] = categoryResult;
        }
    });

    return result;
}

const getFilteredObject = (searchString, inputObject) => {
    if (typeof (inputObject) == "object") {
        let keys = Object.keys(inputObject);
        if (keys && keys.length) {
            return keys.some(key => getFilteredObject(searchString, inputObject[key]));
        }
    }

    return inputObject.toString().toLowerCase().includes(searchString.toLowerCase());
}