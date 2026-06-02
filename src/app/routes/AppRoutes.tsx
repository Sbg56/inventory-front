import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../pages/Products/Products";
import ProductDetailsPage from "../../pages/Products/ProductDetailsPage";
import Warehouses from "../../pages/Warehouses/Warehouses";
import Suppliers from "../../pages/Suppliers/Suppliers";
import StockMovements from "../../pages/StockMovement/StockMovements";
import TradePage from "../../pages/Trade/TradePage";
import PurchasePage from "../../pages/Trade/PurchasePage";
import TradeJournalPage from "../../pages/Trade/TradeJournalPage";
import Employees from "../../pages/Employee/Employees";
import StatisticsPage from "../../pages/Statistics/StatisticsPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/stockMovement" element={<StockMovements />} />

                <Route path="/trade" element={<TradeJournalPage />} />
                <Route path="/trade/sale" element={<TradePage />} />
                <Route path="/trade/purchase" element={<PurchasePage />} />

                <Route path="/employees" element={<Employees />} />
                <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
