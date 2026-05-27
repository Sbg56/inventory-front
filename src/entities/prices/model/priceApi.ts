import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type { PriceRequest, PriceResponse } from "../../../shared/types/priceTypes";

export const priceApi = {
    getPricesByProductId: async (productId: number): Promise<AxiosResponse<PriceResponse[]>> => {
        return api.get(`/api/v1/price/get-by-id/${productId}`);
    },

    createPrice: async (priceRequest: PriceRequest): Promise<AxiosResponse<PriceResponse>> => {
        return api.post(`/api/v1/price/post`, priceRequest);
    },

    updatePrice: async (priceId: number, updates: Record<string, unknown>): Promise<AxiosResponse<PriceResponse>> => {
        return api.patch(`/api/v1/price/patch/${priceId}`, updates);
    },
};