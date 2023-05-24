export const AddZerosToReportNumber = (number) => {
    const maxNumberLength = 8;
    return String(number).padStart(maxNumberLength, '0');
};