import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../pages/Products/Products";
import ProductDetailsPage from "../../pages/Products/ProductDetailsPage";
import Warehouses from "../../pages/Warehouses/Warehouses";
import Suppliers from "../../pages/Suppliers/Suppliers";
import StockMovements from "../../pages/StockMovement/StockMovements";
import TradePage from "../../pages/Trade/TradePage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Products />} />*
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/stockMovement" element={<StockMovements />} />
                <Route path="/trade" element={<TradePage />} />

            </Routes>
        </BrowserRouter>
    );
}