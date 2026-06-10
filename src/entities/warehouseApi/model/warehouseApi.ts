import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {WarehouseRequest, WarehouseResponse} from "../../../shared/types/warehouseTypes";


export const warehouseApi = {
    getAllWarehouses: async (): Promise<AxiosResponse<WarehouseResponse[]>> => {
        return api.get('/api/v1/warehouse/get-all'); //
    },
    createWarehouse: async (warehouseRequest: WarehouseRequest): Promise<AxiosResponse<WarehouseResponse>> => {
        return api.post(`/api/v1/warehouse/post`, warehouseRequest);
    },

    updateWarehouse: async (id: number, updates: Partial<WarehouseRequest>): Promise<AxiosResponse<WarehouseResponse>> => {
        return api.patch(`/api/v1/warehouse/patch/${id}`, updates);
    },

    deleteWarehouse: async (id: number): Promise<AxiosResponse<string>> => {
        return api.delete(`/api/v1/warehouse/delete/${id}`);
    },

};