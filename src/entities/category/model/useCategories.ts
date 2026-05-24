import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "./categoryApi";
import type { CategoryRequest } from "../../../shared/types/categoryTypes";

export const useCategories = () => {
    const queryClient = useQueryClient();

    const useGetAllCategories = () => {
        return useQuery({
            queryKey: ['categories-all'],
            queryFn: async () => {
                const response = await categoryApi.getAllCategories();
                return response.data;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });
    };

    const useCreateCategory = () => {
        return useMutation({
            mutationFn: async (newCategory: CategoryRequest) => {
                const response = await categoryApi.createCategory(newCategory);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories-all'] });
            }
        });
    };

    const useDeleteCategory = () => {
        return useMutation({
            mutationFn: async (id: number) => {
                const response = await categoryApi.deleteCategory(id);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories-all'] });
            }
        });
    };

    return {
        useGetAllCategories,
        useCreateCategory,
        useDeleteCategory, // Экспортируем новый хук наружу
    };
};