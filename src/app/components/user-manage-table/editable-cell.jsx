import React from 'react';
import { strings, roles } from '../../constants';
import { rules } from '../../helpers/validation-rules';
import { CustomInput, CustomSelect } from "../common";

export const EditableCell = ({
    sites,
    editing,
    dataIndex,
    inputType,
    children,
    setValues,
    ...restProps
}) => {

    return (
        <td {...restProps}>
            {editing
                ? (
                    inputType === 'list'
                        ? dataIndex === 'role'
                            ? <CustomSelect name={dataIndex} rules={rules}>{roles}</CustomSelect>
                            : <CustomSelect name={dataIndex} mode="multiple" setFields={setValues} sites={sites} rules={rules} keys={true}>{sites}</CustomSelect>
                        : dataIndex === 'signatureTitle'
                            ? <CustomInput name={dataIndex} />
                            : <CustomInput name={dataIndex} rules={rules} />
                )
                : (children)}
        </td>
    );
};