import { Result } from 'antd';
import React from 'react';
import { AuthorizedLayout } from '../../components/layouts';
import CustomBtn from '../../components/common/custom-button';
import { strings } from '../../constants';
import TrackingService from '../../services/tracking.service';
import { SeverityLevel } from '@microsoft/applicationinsights-web'; 


class ErrorBoundary extends React.Component  {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        TrackingService.trackException(error, SeverityLevel.Error, { message: "Error Boundary catch error."});

        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {

            return (
                <AuthorizedLayout>
                    <div className="error-layout">
                        <Result
                            status="500"
                            title="500"
                            subTitle={strings.ERROR_PAGES_MESSAGE.SERVER_ERROR}
                        />
                        <CustomBtn name="Reload Page" 
                                   style={{ width: '15vw'}} 
                                   type="primary"
                                   onClick={() => window.location.reload()}
                                          >
                        </CustomBtn>
                    </div>
                </AuthorizedLayout>
            );
        }
        
        return this.props.children; 
    }
}

export default ErrorBoundary;