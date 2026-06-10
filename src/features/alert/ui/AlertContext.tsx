import {Alert, type AlertColor, Snackbar} from "@mui/material";
import {type ReactNode, useState} from "react";
import { AlertContext } from "../model/AlertContextType";


interface AlertState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

export function AlertProvider({children}: { children: ReactNode }) {
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        message: '',
        severity: 'info'
    });

    const showAlert = (message: string, severity: AlertColor = 'info') => {
        setAlert({open: true, message, severity});
    }

    const handleClose = () => setAlert((prev) => ({...prev, open: false}));

    return (
        <AlertContext.Provider value={{showAlert}}>
            {children}
            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert severity={alert.severity} onClose={handleClose} variant="filled">
                    {alert.message}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    );
}



