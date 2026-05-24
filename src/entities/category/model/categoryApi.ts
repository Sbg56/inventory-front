
import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type { CategoryResponse, CategoryRequest } from "../../../shared/types/categoryTypes";

export const categoryApi = {
    getAllCategories: async (): Promise<AxiosResponse<CategoryResponse[]>> => {
        return api.get('/api/v1/category/get-all');
    },

    createCategory: async (categoryRequest: CategoryRequest): Promise<AxiosResponse<CategoryResponse>> => {
        return api.post('/api/v1/category/post', categoryRequest);
    },

    deleteCategory: async (id: number): Promise<AxiosResponse<string>> => {
        return api.delete(`/api/v1/category/delete/${id}`);
    },

    updateCategory: async (id: number, updates: Partial<CategoryRequest>): Promise<AxiosResponse<CategoryResponse>> => {
        return api.patch(`/api/v1/category/patch/${id}`, updates);
    }
};