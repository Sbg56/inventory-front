
import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {
    OrderRequest,
    OrderResponse,
    SupplierOrderRequest,
    SupplierOrderResponse,
} from "../../../shared/types/tradeTypes";

export const tradeApi = {
    createSaleOrder: async (request: OrderRequest): Promise<AxiosResponse<OrderResponse>> => {
        return api.post(`/api/v1/trade/sale`, request);
    },

    createPurchaseOrder: async (request: SupplierOrderRequest): Promise<AxiosResponse<SupplierOrderResponse>> => {
        return api.post(`/api/v1/trade/purchase`, request);
    },
};