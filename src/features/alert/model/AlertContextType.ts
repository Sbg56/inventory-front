import type {AlertColor} from "@mui/material";
import {createContext} from "react";

interface AlertContextType {
    showAlert: (message: string, severity?: AlertColor) => void;
}

export const AlertContext = createContext<AlertContextType | null>(null);