
import { useMutation } from "@tanstack/react-query";
import { tradeApi } from "./tradeApi";
import type { OrderRequest, SupplierOrderRequest } from "../../../shared/types/tradeTypes";

export const useTrade = () => {
    const useCreateSaleOrder = () => {
        return useMutation({
            mutationFn: async (request: OrderRequest) => {
                const response = await tradeApi.createSaleOrder(request);
                return response.data;
            },
        });
    };

    const useCreatePurchaseOrder = () => {
        return useMutation({
            mutationFn: async (request: SupplierOrderRequest) => {
                const response = await tradeApi.createPurchaseOrder(request);
                return response.data;
            },
        });
    };

    return {
        useCreateSaleOrder,
        useCreatePurchaseOrder,
    };
};