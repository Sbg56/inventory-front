import { useQuery } from "@tanstack/react-query";
import {productApi} from "./productApi";


export const useGetProducts = () => {
    const useGetProductsByCategory = (catId: number, enabled: boolean) => {
        return useQuery({
            queryKey: ['products-by-category', catId],
            queryFn: async () => {
                const response = await productApi.getProductsByCategory(catId);
                return response.data;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            enabled: enabled,
        });
    };

    return {
        useGetProductsByCategory,
    };
};