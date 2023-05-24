import moment from "moment-timezone";
import { strings } from "../constants";
import { DEFAULT_UTC_OFFSET } from "./timeline-helper";

export const DEFAULT_TIME_ZONE = "EST";
export const UTC_TIME_ZONE = "UTC";
export const DEFAULT_WO_DURATION_IN_HOURS = 1;

export const formatDate = (date) => {
    return moment(date).format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_FORMAT);
};

export const formatBreakListDate = (date) => {
    return moment(date).format(strings.FIELD_FORMATS.DEFAULT_DATE_TIME_BREAK_LIST_FORMAT);
};

export const formatNotificationManagementDate = (date) => {
    return moment(moment.tz(date, DEFAULT_TIME_ZONE)).tz(UTC_TIME_ZONE).hour(0).minute(0).second(0).format();
}

export const getWOStartDate = (date) => {
    return moment.utc(date).utcOffset(DEFAULT_UTC_OFFSET).hour(0).minute(0).second(0).format();
}

export const getWOEndDate = (date) => {
    return moment.utc(date).utcOffset(DEFAULT_UTC_OFFSET).add(1, 'days').hour(0).minute(0).second(0).format();
}
// export const getDefaultWoStartDate = () => {
//     const today = moment.tz(DEFAULT_TIME_ZONE).startOf("day").hour(8).tz(UTC_TIME_ZONE);
//     if (today.format('dddd') == 'Friday') {
//         return today.add(3, 'days');
//     }

//     return today.add(1, 'days');
// };

export const getDefaultWoStartDate = () => {
    return moment.tz(DEFAULT_TIME_ZONE).startOf("day").hour(8).tz(UTC_TIME_ZONE);
};

export const getDefaultPickupWoStartDate = (parentWorkOrderStartDate) => {
    const defaultPickupJobDelayDays = 1;

    return moment.tz(parentWorkOrderStartDate, DEFAULT_TIME_ZONE).add(defaultPickupJobDelayDays, 'days').hour(8).tz(UTC_TIME_ZONE);
}

export const disabledMinutes = (_current) => {
    return [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
        46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59
    ];
};

Object.defineProperty(String.prototype, "toUTCKind", {
    value: function toUTCKind() {
        return moment.tz(this, UTC_TIME_ZONE);
    },
    writable: true,
    configurable: true
});

Object.defineProperty(moment.prototype, "convertToEST", {
    value: function convertToEST(formatPattern) {
        return !!formatPattern ? moment(this).tz(DEFAULT_TIME_ZONE).format(formatPattern) : moment(this).tz(DEFAULT_TIME_ZONE);
    },
    writable: true,
    configurable: true
});

export const getTimeFromDate = (date) => {
    const parsedDate = Date.parse(date);
    if (date && date !== 'N/A') {
        return isNaN(parsedDate) === false ? moment(date).format(strings.FIELD_FORMATS.DEFAULT_TIME_FORMAT) : date;
    } else {
        return 'N/A';
    }
};