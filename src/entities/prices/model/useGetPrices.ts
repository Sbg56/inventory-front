import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceApi } from "./priceApi";
import type { PriceRequest } from "../../../shared/types/priceTypes";

export const useGetPrices = () => {
    const queryClient = useQueryClient();

    const usePricesByProductId = (productId: number) => {
        return useQuery({
            queryKey: ["prices-by-product", productId],
            queryFn: async () => {
                const response = await priceApi.getPricesByProductId(productId);
                return response.data;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });
    };

    const useCreatePrice = (productId: number) => {
        return useMutation({
            mutationFn: (priceRequest: PriceRequest) => priceApi.createPrice(priceRequest),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["prices-by-product", productId] });
            },
        });
    };

    const useUpdatePrice = (priceId: number, productId: number) => {
        return useMutation({
            mutationFn: (updates: Record<string, unknown>) => priceApi.updatePrice(priceId, updates),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["prices-by-product", productId] });
            },
        });
    };

    const useDeactivatePrice = (productId: number) => {
        return useMutation({
            mutationFn: (priceId: number) => priceApi.updatePrice(priceId, { isActive: false }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["prices-by-product", productId] });
            },
        });
    };

    return {
        usePricesByProductId,
        useCreatePrice,
        useUpdatePrice,
        useDeactivatePrice,
    };
};