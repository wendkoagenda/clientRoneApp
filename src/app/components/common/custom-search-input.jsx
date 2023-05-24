import React from 'react';
import { Input } from 'antd';

const SearchInput = (props) => {

    return (
        <div className="search-input">
            <Input
                placeholder={props.placeholder}
                prefix={props.prefix}
                type={props.type}
                value={props.value}
                style={props.style}
                onChange={props.onChange}
                ref={props.searchInputRef}
                defaultValue={props.defaultValue}
            >
            </Input>
        </div>
    )
}

export default SearchInput;