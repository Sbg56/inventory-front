
import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type { CategoryResponse, CategoryRequest } from "../../../shared/types/categoryTypes";

export const categoryApi = {
    getAllCategories: async (): Promise<AxiosResponse<CategoryResponse[]>> => {
        return api.get('/api/v1/category/get-all');
    },

    createCategory: async (categoryRequest: CategoryRequest): Promise<AxiosResponse<CategoryResponse>> => {
        return api.post('/api/v1/category/post', categoryRequest);
    }
};