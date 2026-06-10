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
import HistoryPage from "../../pages/History/HistoryPage";
import ProtectedRoute from "./ProtectedRoute";

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

                <Route
                    path="/trade/sale"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                            <TradePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trade/purchase"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                            <PurchasePage />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Employees />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/statistics"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                            <StatisticsPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </BrowserRouter>
    );
}