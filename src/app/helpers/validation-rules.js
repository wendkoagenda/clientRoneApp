import { strings } from '../constants';
import { getOnlyNumbers } from './text.helper';

export const rules = [
    {
        required: true,
        message: `${strings.VALIDATE_MESSAGES.REQUIRED}`,
    },
];

export const emailRule = [
    {
        required: true,
        type: "email",
        message: "The input is not valid E-mail!"
    }
]

export const zipCodeRule = [
    {
        required: true,
        message: `Zipcode ${strings.VALIDATE_MESSAGES.IS_REQUIRED}`
    },
    {
        pattern: new RegExp(/^[0-9]+$/),
        message: `${strings.VALIDATE_MESSAGES.ZIP_CODE_NUMBER}`
    },
    {
        len: 5,
        message: `${strings.VALIDATE_MESSAGES.LEN("ZipCode", 5)}`
    }
]

export const positiveNumberRule = [
    {
        type: "number",
        min: 0,
        message: `${strings.VALIDATE_MESSAGES.POSITIVE_NUMBER}`,
    }
]

export const maskedPhoneNumberRule = (_, value) =>
    getOnlyNumbers(value).length === 10 ? Promise.resolve() : Promise.reject(new Error(strings.INPUT_RULES.COMMON.PHONE_NUMBER));

export const projectNumberRule = (_, value) =>
    value.length === 7 ? Promise.resolve() : Promise.reject(new Error(strings.VALIDATE_MESSAGES.PROJECT_NUMBER));