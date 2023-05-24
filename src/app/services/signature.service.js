import axios from 'axios';
import getConfig from "../../app/config";

const GET_SIGNATURE_ENDPOINT = (userId) => `/signature/${userId}`;
const UPLOAD_SIGNATURE_ROUTE = (userId) => `${getConfig().apiBaseUrl}/signature/${userId}`;

class _SignatureService {

    getSignature(userId) {
        return axios.get(`${getConfig().apiBaseUrl}${GET_SIGNATURE_ENDPOINT(userId)}`);
    }

    uploadSignature(image, userId) {
        const form = new FormData();
        form.append("signatureImage", image);

        return axios({
            method: 'post',
            url: UPLOAD_SIGNATURE_ROUTE(userId),
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        });
    }
}

const SignatureService = new _SignatureService();
export default SignatureService;