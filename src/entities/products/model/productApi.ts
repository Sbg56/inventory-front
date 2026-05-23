import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {ProductResponse} from "../../../shared/types/productTypes.ts"


export const productApi = {

    getProductsByCategory: async (catId: number): Promise<AxiosResponse<ProductResponse[]>> => {
        return api.get(`/api/v1/product/get-all/${catId}`);
    },


    getActiveProductsByCategory: async (catId: number): Promise<AxiosResponse<ProductResponse[]>> => {
        return api.get(`/api/v1/product/get-active/${catId}`);
    }
};