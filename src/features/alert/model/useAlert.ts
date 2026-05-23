import {useContext} from "react";
import {AlertContext} from "./AlertContextType.ts"

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useAlert() must be used within the context!');
    return ctx;
}