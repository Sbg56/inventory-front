import { useQuery } from "@tanstack/react-query";
import api from "../../../shared/api/axios/axiosInstance";
import type { OrderResponse, SupplierOrderResponse } from "../../../shared/types/tradeTypes";
import type { StockMovementResponse } from "../../../shared/types/stockMovementTypes";

// Fetch all orders (sales)
const fetchOrders = async (): Promise<OrderResponse[]> => {
    const res = await api.get("/api/v1/trade/get-order");
    return res.data;
};

// Fetch all supplier orders (purchases)
const fetchSupplierOrders = async (): Promise<SupplierOrderResponse[]> => {
    const res = await api.get("/api/v1/trade/get-supplier-order");
    return res.data;
};

// Fetch order structures (detailed items)
const fetchOrderStructures = async () => {
    const res = await api.get("/api/v1/trade/get-order-structure");
    return res.data;
};

// Fetch supplier order structures
const fetchSupplierOrderStructures = async () => {
    const res = await api.get("/api/v1/trade/get-supplier-order-structure");
    return res.data;
};

export const useStatistics = () => {
    const ordersQuery = useQuery({
        queryKey: ["stats-orders"],
        queryFn: fetchOrders,
    });

    const supplierOrdersQuery = useQuery({
        queryKey: ["stats-supplier-orders"],
        queryFn: fetchSupplierOrders,
    });

    const orderStructuresQuery = useQuery({
        queryKey: ["stats-order-structures"],
        queryFn: fetchOrderStructures,
    });

    const supplierStructuresQuery = useQuery({
        queryKey: ["stats-supplier-structures"],
        queryFn: fetchSupplierOrderStructures,
    });

    return {
        orders: ordersQuery.data ?? [],
        supplierOrders: supplierOrdersQuery.data ?? [],
        orderStructures: orderStructuresQuery.data ?? [],
        supplierStructures: supplierStructuresQuery.data ?? [],
        isLoading:
            ordersQuery.isLoading ||
            supplierOrdersQuery.isLoading ||
            orderStructuresQuery.isLoading ||
            supplierStructuresQuery.isLoading,
        error:
            ordersQuery.error ||
            supplierOrdersQuery.error ||
            orderStructuresQuery.error ||
            supplierStructuresQuery.error,
    };
};
