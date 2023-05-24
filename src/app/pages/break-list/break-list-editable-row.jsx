import React, { useContext, useState, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { reportTypesIds, strings } from '../../constants';
import { concreteReportTypeIds } from '../../constants/report-types'
import { CustomInput, CustomSingleOptionSelect } from '../../components/common';
import { fractureTypeSelectOptions } from '../../constants/fractureTypes';
import { positiveNumberRule } from '../../helpers/validation-rules'
import { BREAK_DATE } from '../../constants/report-props'
import {
  WET_MATERIAL_TARE,
  DRY_MATERIAL_TARE,
  TARE,
  NO_OF_BLOWS,
} from '../../constants/report-props';
import {
  calculateArea,
  calculateCompressiveStrength,
  calculateDryDensity
} from '../../helpers/math-helper';
import {
  calculatePlasticityIndex,
  calculateMoistureContent,
  calculateLiquidLimit,
  calculatePlasticLimit,
  calculatePercentPass
} from "../../helpers/moisture-density-relationship-reports-calculations-helper";
import moment from 'moment';

const EditableContext = React.createContext(null);

export const EditableRow = ({
    ...props
}) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

export const EditableCell = ({
    editable,
    children,
    record,
    title,
    isNumber,
    isDate,
    dataIndex,
    reportType,
    sorterProp,
    handleSave,
    handleEdit,
    handleSaveTestedBy,
    userNameSelectOptions,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext(EditableContext);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const handleChangeFracture = (value) => {
        form.setFieldsValue({
            ...record,
            fracture: value,
            fractureType: value
        })
        handleEdit({
            ...record,
            fracture: value,
            fractureType: value
        });
    }

    const handleChangeTestedBy = (value) => {
        form.setFieldsValue({
            ...record,
            fracture: record?.fractureType,
            fractureType: record?.fractureType,
            testedBy: value
        })
        handleEdit({
            ...record,
            fracture: record?.fractureType,
            fractureType: record?.fractureType,
            testedBy: value
        });
    }

    const handleDiameterOrMaximumLoadChange = (value, propName, isNumber) => {
        if (propName === strings.REPORTS.PROPS_NAME.DIAMETER) {
            var newArea = value ? calculateArea(value) : 0;
            form.setFieldsValue({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : 0,
                area: newArea,
                compressiveStrength: value && newArea && record?.maximumLoad ? calculateCompressiveStrength(record?.maximumLoad, newArea) : 0,
                maximumLoad: record?.maximumLoad
            })
            handleEdit({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : 0,
                area: newArea,
                compressiveStrength: value && newArea && record?.maximumLoad ? calculateCompressiveStrength(record?.maximumLoad, newArea) : 0,
                maximumLoad: record?.maximumLoad
            });
        } else {

            if (propName === BREAK_DATE.dataIndex)
            {
              form.setFieldsValue({
                ...record,
                [propName]: moment.utc(value)
                
            })
            handleEdit({
              ...record,
              [propName]: moment.utc(value)
          });
            } else {
            form.setFieldsValue({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : (isDate ? moment(value) : value)) : 0,
                area: record.area,
                compressiveStrength: value ? calculateCompressiveStrength(value, record?.area) : 0,
                diameter: record?.diameter
            })
            handleEdit({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : (isDate ? moment(value) : value)) : 0,
                area: record?.area,
                compressiveStrength: value ? calculateCompressiveStrength(value, record?.area) : 0,
                diameter: record?.diameter
            });
          }
        }
    }

    const handleMoistureOrWetDensityChange = (value, propName, isNumber) => {
        if (propName === strings.REPORTS.PROPS_NAME.MOISTURE) {
            form.setFieldsValue({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(value), Number(record?.wetDensity))
            })
            handleEdit({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(value), Number(record?.wetDensity))
            });
        } else {
            form.setFieldsValue({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(record?.moisture), Number(value))
            })
            handleEdit({
                ...record,
                fracture: record?.fractureType,
                fractureType: record?.fractureType,
                [propName]: value ? (isNumber ? Number(value) : value) : null,
                dryDensity: calculateDryDensity(Number(record?.moisture), Number(value))
            });
        }
    }

    const handleSoilMoistureFieldChange = (value, propName, isNumber) => {
      if (propName === WET_MATERIAL_TARE.dataIndex ||
          propName === DRY_MATERIAL_TARE.dataIndex ||
          propName === TARE.dataIndex ||
          propName === NO_OF_BLOWS.dataIndex
      ) {
        let moistureContent = calculateMoistureContent(record?.wetMaterialTare, record?.dryMaterialTare, record?.tare);
        let liquidLimit = calculateLiquidLimit(moistureContent, record?.noOfBlows);
        let plasticLimit = calculatePlasticLimit(record?.wetMaterialTare, record?.dryMaterialTare, record?.tare);
        let plasticityIndex = calculatePlasticityIndex(liquidLimit, plasticLimit);
        let passing = calculatePercentPass(record?.wetMaterialTare, record?.dryMaterialTare, record?.tare)
        form.setFieldsValue({
          ...record,
          fracture: record?.fractureType,
          fractureType: record?.fractureType,
          [propName]: value ? (isNumber ? Number(value) : value) : null,
          liquidLimit: isNaN(liquidLimit) ? record?.liquidLimit : liquidLimit,
          plasticLimit: isNaN(plasticLimit) ? record?.plasticLimit : plasticLimit,
          plasticityIndex: isNaN(plasticityIndex) ? record?.plasticityIndex : plasticityIndex,
          passing: isNaN(passing) ? record.passing : passing
        });
        handleEdit({
          ...record,
          fracture: record?.fractureType,
          fractureType: record?.fractureType,
          [propName]: value ? (isNumber ? Number(value) : value) : null,
          liquidLimit: isNaN(liquidLimit) ? record?.liquidLimit : liquidLimit,
          plasticLimit: isNaN(plasticLimit) ? record?.plasticLimit : plasticLimit,
          plasticityIndex: isNaN(plasticityIndex) ? record?.plasticityIndex : plasticityIndex,
          passing: isNaN(passing) ? record.passing : passing
        });
      }
    }

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            ...record,
            fracture: record?.fractureType,
            fractureType: record?.fractureType,
            [dataIndex]: record[dataIndex],
        });
    };

    const saveTestedBy = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSaveTestedBy({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    const isConcrete = (reportType) => {
        return Object.values(concreteReportTypeIds).some(id => id === reportType)
    }

    let childNode = children;

    if (editable) {
        childNode = editing ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
          >
            {(sorterProp === strings.REPORTS.PROPS_NAME.FRACTURE &&
              reportType === reportTypesIds.CONCRETE_CYLINDERS) ||
            sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY ? (
              <CustomSingleOptionSelect
                inputRef={inputRef}
                name={sorterProp}
                value={
                  sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY
                    ? record.testedBy
                    : record?.fractureType
                }
                placeholder={title}
                options={
                  sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY
                    ? userNameSelectOptions
                    : fractureTypeSelectOptions
                }
                handleChange={(value) =>
                  sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY
                    ? handleChangeTestedBy(value)
                    : handleChangeFracture(value)
                }
                onPressEnter={
                  sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY
                    ? saveTestedBy
                    : save
                }
                onBlur={
                  sorterProp === strings.REPORTS.PROPS_NAME.TESTED_BY
                    ? saveTestedBy
                    : save
                }
              />
            ) : (
              <CustomInput
                rules={isConcrete(reportType) && isNumber
                              ? positiveNumberRule
                              : null}
                inputRef={inputRef}
                name={sorterProp}
                type={ isDate ? "date" : isNumber ? "number" : "text"}
                normalize={isNumber && ((e) => Number(e).toFixed(2))}
                onPressEnter={save}
                onBlur={save}
                onInputChange={(e) => {
                  switch (reportType) {
                    case reportTypesIds.CONCRETE_CYLINDERS:
                      handleDiameterOrMaximumLoadChange(
                        e.target.value,
                        dataIndex,
                        true
                      );
                      break;
                    case reportTypesIds.SOIL_IN_PLACE_DENSITY_TESTING:
                      handleMoistureOrWetDensityChange(
                        isNumber ? Number(e.target.value).toFixed(2) : e.target.value,
                        dataIndex,
                        true
                      );
                      break;
                    case reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP:
                      handleSoilMoistureFieldChange(
                        isNumber ? Number(e.target.value).toFixed(2) : e.target.value,
                        dataIndex,
                        true
                      );
                      break;
                    case reportTypesIds.SOIL_MOISTURE_DENSITY_RELATIONSHIP_Tex_113_E:
                      handleSoilMoistureFieldChange(
                        isNumber ? Number(e.target.value).toFixed(2) : e.target.value,
                        dataIndex,
                        true
                      );
                      break;
                    default:
                      null;
                  }
                }}
              />
            )}
          </Form.Item>
        ) : (
          <div
            key={sorterProp}
            className="editable-break-list-cell-value-wrap"
            style={{
              paddingRight: 24,
            }}
            onClick={toggleEdit}
            onFocus={toggleEdit}
          >
            {children}
          </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};