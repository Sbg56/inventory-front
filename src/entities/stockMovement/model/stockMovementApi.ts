import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type { StockMovementRequest, StockMovementResponse } from "../../../shared/types/stockMovementTypes";

export const stockMovementApi = {
    getMovementsByProduct: async (productId: number): Promise<AxiosResponse<StockMovementResponse[]>> => {
        return api.get(`/api/v1/movement/get/${productId}`);
    },

    createMovement: async (request: StockMovementRequest): Promise<AxiosResponse<StockMovementResponse>> => {
        return api.post(`/api/v1/movement/post`, request);
    }
};