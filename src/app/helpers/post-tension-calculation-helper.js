export const calculateTotalElongation = (elongationSubtotal, restressElongation) => {
    return Number(elongationSubtotal) + Number(restressElongation)
}

export const calculatePercentElongation = (totalElongation, requiredElongation) => {
    return Number(Number(totalElongation) / Number(requiredElongation) * 100).toFixed(0);
}

export const calculateElongationSubtotal = (elongationFirst, elongationSecond) => {
    return Number(elongationFirst) + Number(elongationSecond)
}