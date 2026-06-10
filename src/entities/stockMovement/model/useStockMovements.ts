import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StockMovementRequest } from "../../../shared/types/stockMovementTypes";
import {stockMovementApi} from "./stockMovementApi";

export const useStockMovements = () => {
    const queryClient = useQueryClient();

    const useGetMovementsByProduct = (productId: number | null) => {
        return useQuery({
            queryKey: ["stock-movements", productId],
            queryFn: async () => {
                if (!productId) return [];
                const response = await stockMovementApi.getMovementsByProduct(productId);
                return response.data;
            },
            enabled: !!productId,
            refetchOnWindowFocus: false,
        });
    };

    const useCreateMovement = () => {
        return useMutation({
            mutationFn: async (newMovement: StockMovementRequest) => {
                const response = await stockMovementApi.createMovement(newMovement);
                return response.data;
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ["stock-movements", variables.productId] });
                queryClient.invalidateQueries({ queryKey: ["products-by-id", variables.productId] });
            },
        });
    };

    return {
        useGetMovementsByProduct,
        useCreateMovement,
    };
};