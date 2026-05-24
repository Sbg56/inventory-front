
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {categoryApi} from "./categoryApi";
import type {CategoryRequest} from "../../../shared/types/categoryTypes";


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
                // Автоматически обновляем список категорий в меню
                queryClient.invalidateQueries({ queryKey: ['categories-all'] });
            }
        });
    };

    return {
        useGetAllCategories,
        useCreateCategory,
    };
};