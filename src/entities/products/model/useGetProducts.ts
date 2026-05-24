import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {productApi} from "./productApi";
import type {ProductRequest} from "../../../shared/types/productTypes";


export const useGetProducts = () => {

    const queryClient = useQueryClient();

    const useGetProductsByCategory = (catId: number) => {
        return useQuery({
            queryKey: ['products-by-category', catId],
            queryFn: async () => {
                const response = await productApi.getActiveProductsByCategory(catId);
                return response.data;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });
    };

    const useCreateProduct = () => {
        return useMutation({
            mutationFn: async (newProduct: ProductRequest) => {
                const response = await productApi.createProduct(newProduct);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['products-by-category'] });
            }
        });
    };

    return {
        useGetProductsByCategory,
        useCreateProduct,
    };
};