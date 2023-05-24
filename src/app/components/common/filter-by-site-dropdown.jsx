import React from 'react';
import { Checkbox, Button } from 'antd';
import { sites } from '../../constants';
import { connect } from 'react-redux';
import TextCrop from './text-crop';
import { EnvironmentOutlined } from '@ant-design/icons';

export const renderProjectSiteById = (_cell, row, allSites) => {
    return (
        <div className="dispatch-info-col">
            <EnvironmentOutlined />
            <TextCrop inputString={allSites.find(i => i.id == row.siteId)?.name} title="Project Site" />
        </div>
    );
};

const FilterBySiteDropdown = (props) => {

    const handleCheckboxClick = (values) => {
        const boxSelected = values.filter(item => props.value.indexOf(item) == -1);
        const deselectedValue = props.value.filter(e => !values.includes(e))[0];
        const filteredByRone = props.allSites.filter(item => !item.name.includes(sites.JRB));
        const filteredByJrb = props.allSites.filter(item => item.name.includes(sites.JRB));

        switch (boxSelected[0]) {
            case sites.RONE:
                props.onChange([...values, ...filteredByRone.map(item => props.isById ? item.id : item.name)], props.option);
                break;

            case sites.JRB:
                props.onChange([...values, ...filteredByJrb.map(item => props.isById ? item.id : item.name)], props.option);
                break;

            default:
                let filteredValues = [];

                if (deselectedValue == sites.RONE || deselectedValue == sites.JRB) {
                    const filteredBySite = deselectedValue == sites.RONE ? filteredByRone : filteredByJrb;

                    filteredValues = values.filter(item => !filteredBySite.some(i => {
                        if (props.isById) {
                            return i.id == item;
                        } else {
                            return i.name == item;
                        }
                    }))
                } else {
                    filteredValues = values;
                }

                props.onChange(filteredValues, props.option);
                break;
        }
    }

    return (
        <div className="checkbox-dropdown" style={props.style}>
            <Checkbox.Group style={{ width: '100%' }} value={props.value} onChange={handleCheckboxClick}>
                <Checkbox value={sites.RONE}>{sites.RONE}</Checkbox>
                {props.allSites.length > 0 &&
                    props.allSites.map(item =>
                        !item.name.includes(sites.JRB) && <Checkbox key={item.id} style={{ marginLeft: '10%', width: '100%' }} value={props.isById ? item.id : item.name}>{item.name}</Checkbox>)
                }
                <Checkbox value={sites.JRB}>{sites.JRB}</Checkbox>
                {props.allSites.length > 0 &&
                    props.allSites.map(item =>
                        item.name.includes(sites.JRB) && <Checkbox key={item.id} style={{ marginLeft: '10%', width: '100%' }} value={props.isById ? item.id : item.name}>{item.name}</Checkbox>)
                }

                {!props.withoutSearchButton &&
                    (
                        <Button type="primary" onClick={props.submit}>Search</Button>
                    )
                }
            </Checkbox.Group>
        </div>
    )
}

const mapState = ({ authorizedLayout }) => {
    return {
        allSites: authorizedLayout.allSites,
    }
}

export default connect(mapState, null)(FilterBySiteDropdown);