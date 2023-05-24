import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import routes from '../../pages/routes';
import IdentityService from '../../services/identity.service';

const UnauthenticatedRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props =>
        IdentityService.isAuthenticated() 
            ?   <Redirect to={{ pathname: routes.HOME, state: { from: props.location } }} />
            :   <Component {...props} />
        } 
    />
)


export default UnauthenticatedRoute;