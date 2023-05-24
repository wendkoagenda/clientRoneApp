import { Result } from 'antd';
import React from 'react';
import routes from '../routes';
import CustomBtn from '../../components/common/custom-button';
import { strings } from '../../constants';

const NotFoundPage = () => {

    const redirectToHome = () => {
        location.href = routes.HOME;
    }

    return (
        <div className="error-layout">
            <Result
                status="404"
                title="404"
                subTitle={strings.ERROR_PAGES_MESSAGE.NOT_FOUND}
            />
            <CustomBtn name={strings.COMMON.BACK_HOME}
                style={{ width: '15vw' }}
                type="primary"
                onClick={redirectToHome}>
            </CustomBtn>
        </div>
    );
}

export default NotFoundPage;