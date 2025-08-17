import { useState, useEffect } from 'react';

function getValue<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = window.localStorage.getItem(key);
    try {
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error('Error parsing JSON from localStorage', error);
        return defaultValue;
    }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => getValue(key, defaultValue));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                try {
                    setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
                } catch (error) {
                    console.error('Error parsing JSON from storage event', error);
                    setValue(defaultValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, defaultValue]);

    const setStoredValue = (newValue: T | ((val: T) => T)) => {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch a storage event to sync across tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key,
                newValue: JSON.stringify(valueToStore),
            }));
        }
    };

    return [value, setStoredValue];
}
