import {useEffect, useState} from "react";


export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storageValue, setStorageValue] = useState<T>( () => {
        if ( typeof window === 'undefined' ) {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (e) {
            console.error(e);
            return initialValue;
        }
    });

    useEffect(() => {
        if ( typeof window !== 'undefined' ) {
            try {
                window.localStorage.setItem(key, JSON.stringify(storageValue));
            } catch (e) {
                console.error(e);
            }
        }
    }, [ key, storageValue])


    return [storageValue, setStorageValue] as const;
}