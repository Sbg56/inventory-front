import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {SupplierResponse} from "../../../shared/types/supplierTypes";


export const supplierApi = {

    getActiveSuppliers: async (): Promise<AxiosResponse<SupplierResponse[]>> => {
        return api.get('/api/v1/supplier/get-active');
    }
};