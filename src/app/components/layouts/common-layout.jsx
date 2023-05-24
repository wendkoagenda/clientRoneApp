import { withRouter } from 'react-router';
import withAppInsights from '../../app-insights';

const CommonLayout = (Component) => {
    return withAppInsights(withRouter(Component));
}

export default CommonLayout;