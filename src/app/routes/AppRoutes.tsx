import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../pages/Products/Products";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Products />} />*
            </Routes>
        </BrowserRouter>
    );
}