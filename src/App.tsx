import AppRoutes from "./app/routes/AppRoutes";
import {AlertProvider} from "./features/alert/ui/AlertContext";


function App() {

    return (
            <AlertProvider>
                <AppRoutes/>
            </AlertProvider>
    )
}

export default App
