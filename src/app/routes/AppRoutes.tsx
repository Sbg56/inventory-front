import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../pages/Products/Products";
import ProductDetailsPage from "../../pages/Products/ProductDetailsPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Products />} />*
                <Route path="/products/:id" element={<ProductDetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}