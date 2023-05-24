import { useMemo } from 'react';
import reactUseLocalStorage from 'react-use-localstorage';

const useLocalStorage = (key, initialValue = undefined) => {
    const [_value, setValue] = reactUseLocalStorage(key, initialValue);
    const value = useMemo(() => _value === undefined ? undefined : JSON.parse(_value), [_value]);

    return [value, setValue];
}

export default useLocalStorage;