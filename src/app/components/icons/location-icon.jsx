import React from 'react';
import Icon from '@ant-design/icons';

const LocationArrowSolid = (props) => {

    const LocationArrow = () => (
        <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512">
            <path fill="currentColor" d="M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91c0 51.17 70.36 67.17 92.75 19.19l191.9-415.78c15.99-38.39-25.59-79.97-63.97-63.97z"></path>
        </svg>
    );

    return (
        <Icon component={LocationArrow} {...props} />
    )
}

export default LocationArrowSolid;