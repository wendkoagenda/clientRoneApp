import { reportTypesIds } from '../constants';

export const updateFooter = (reportTypeId) => {
    const REPORT_LAYOUT_PREVIEW_DIV_ID = 'report-layout-pdf-doc-elem';

    let pdf = document.getElementById(REPORT_LAYOUT_PREVIEW_DIV_ID);
    let pagesCount = pdf.querySelectorAll('.page').length
    let bottomPosition = 0;
    let difference = reportTypeId == reportTypesIds.CONCRETE_POST_TENSION_INSPECTION
        ? 1120
        : 1086;
    for (let i = 0; i < pagesCount; i++) {
        let temp = document.createElement("div")
        temp.style.position = "absolute";
        temp.style.bottom = `${bottomPosition}px`;
        temp.style.left = "330px";
        temp.insertAdjacentText('beforeend', `Page ${i+1} of ${pagesCount}`);
        pdf.appendChild(temp);
        bottomPosition -= difference;
    }
}