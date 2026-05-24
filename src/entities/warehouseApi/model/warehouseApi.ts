import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {WarehouseResponse} from "../../../shared/types/warehouseTypes";


export const warehouseApi = {
    getAllWarehouses: async (): Promise<AxiosResponse<WarehouseResponse[]>> => {
        return api.get('/api/v1/warehouse/get-all'); //
    }
};