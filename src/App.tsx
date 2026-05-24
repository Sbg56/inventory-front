import AppRoutes from "./app/routes/AppRoutes";
import {AlertProvider} from "./features/alert/ui/AlertContext";
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: '#cb6233',  // Тот самый мягкий матово-тыквенный цвет
            dark: '#9e4720',  // Глубокий терракотовый для эффектов наведения (hover)
            light: '#e08863', // Пастельно-оранжевый для легких акцентов
        },
    },
});

function App() {

    return (
        <ThemeProvider theme={theme}>
            <AlertProvider>
                <AppRoutes/>
            </AlertProvider>
        </ThemeProvider>
    )
}

export default App
