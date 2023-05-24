import moment from "moment";

export const TIMELINE_RESOLUTION_IN_FIFTEEN = 15;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const TIMELINE_CELL_WIDTH = 55;
export const MINIMAL_ORDER_DURATION = 15;
export const DEFAULT_UTC_OFFSET = -5;

export const createTimeline = () => {
    const timelineArray = [];

    const utcMoment = moment().utcOffset(DEFAULT_UTC_OFFSET);

    const initialValue = moment().utcOffset(DEFAULT_UTC_OFFSET).set({
        'year': utcMoment.year(),
        'month': utcMoment.month(),
        'date': utcMoment.date(),
        'hour': 0,
        'minute': 0,
        'second': 0
    }).format();

    timelineArray.push(initialValue);

    while (
        moment(timelineArray[timelineArray.length - 1]).utcOffset(-5).hours() != 23 ||
        moment(timelineArray[timelineArray.length - 1]).utcOffset(-5).minutes() != 45
    ) {
        timelineArray.push(
            moment().utcOffset(-5).set({
                'year': utcMoment.year(),
                'month': utcMoment.month(),
                'date': utcMoment.utcOffset(-5).date(),
                'hour': moment(timelineArray[timelineArray.length - 1]).utcOffset(-5).hours(),
                'minute': moment(timelineArray[timelineArray.length - 1]).utcOffset(-5).minutes() + 15,
                'second': moment(timelineArray[timelineArray.length - 1]).utcOffset(-5).seconds()
            }).format()
        );
    }

    timelineArray.sort((a, b) => { return moment(a) - moment(b) });

    return timelineArray;
};

export const isCurrentTime = (timeSection) => {
    const now = moment().utcOffset(DEFAULT_UTC_OFFSET);
    const diffInMinutes = Math.abs(moment.duration(timeSection.diff(now)).asMinutes());

    return diffInMinutes <= TIMELINE_RESOLUTION_IN_FIFTEEN / 2
}