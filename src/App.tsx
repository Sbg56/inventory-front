import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './shared/auth/keycloak';
import AppRoutes from "./app/routes/AppRoutes";
import { AlertProvider } from "./features/alert/ui/AlertContext";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
    palette: { primary: { main: '#cb6233', dark: '#9e4720', light: '#e08863' } },
});

function App() {
    return (
        <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={{ onLoad: 'login-required' }}
        >
            <ThemeProvider theme={theme}>
                <AlertProvider>
                    <AppRoutes />
                </AlertProvider>
            </ThemeProvider>
        </ReactKeycloakProvider>
    );
}

export default App;