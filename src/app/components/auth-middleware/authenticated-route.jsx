import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import NotFoundPage from '../../pages/not-found';
import routes from '../../pages/routes';
import IdentityService from '../../services/identity.service';

const isRouteAllowedForRole = (allowedRoles, refreshIdentity) => {
    if (allowedRoles && allowedRoles.length > 0) {
        const isInRole = IdentityService.isInRoles(allowedRoles);
        if (isInRole) {
            if (refreshIdentity) {
                Promise.resolve(refreshIdentity());
            }

            return true;
        }
    }

    return true;
}

const AuthenticatedRoute = ({ component: Component, refreshIdentity, ...rest }) => (
    <Route {...rest} render={props =>
        IdentityService.isAuthenticated() ?
            isRouteAllowedForRole(rest.roles, refreshIdentity) ?
                <Component {...props} /> :
                <NotFoundPage /> :
            <Redirect to={{ pathname: routes.LOGIN, state: { from: props.location } }} />}
    />
)

export default AuthenticatedRoute;