import { localStorageKeys } from "../constants";

class _LocalStorageService {
    setIdentityData(identity) {
        localStorage.setItem(localStorageKeys.IDENTITY, JSON.stringify(identity));
    }

    getIdentityData() {
        return JSON.parse(localStorage.getItem(localStorageKeys.IDENTITY));
    }

    setKeysData(keys) {
        localStorage.setItem(localStorageKeys.DISPATCH_PROCESS_SIDE_BAR_KEYS, JSON.stringify(keys));
    }

    getKeysData() {
        return JSON.parse(localStorage.getItem(localStorageKeys.DISPATCH_PROCESS_SIDE_BAR_KEYS));
    }
}

const LocalStorageService = new _LocalStorageService();
export default LocalStorageService;