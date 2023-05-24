import axios from 'axios';
import getConfig from "../../app/config";

const GET_PROFILE_ENDPOINT = '/profile/me';
const EDIT_PROFILE_ENDPOINT = '/profile/me';
const GET_RELATED_NOTIFICATIONS_ROUTE = "/Notification"

class _ProfileService {
    getUser() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_PROFILE_ENDPOINT}`);
    }

    updateUser(editProfileModel) {
        return axios.put(`${getConfig().apiBaseUrl}${EDIT_PROFILE_ENDPOINT}`, editProfileModel);
    }

    getWorkOrderNotifications() {
        return axios.get(`${getConfig().apiBaseUrl}${GET_RELATED_NOTIFICATIONS_ROUTE}`);
    }
}

const ProfileService = new _ProfileService();
export default ProfileService;