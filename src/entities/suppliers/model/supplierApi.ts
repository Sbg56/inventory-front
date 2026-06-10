import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type {SupplierRequest, SupplierResponse} from "../../../shared/types/supplierTypes";


export const supplierApi = {

    getActiveSuppliers: async (): Promise<AxiosResponse<SupplierResponse[]>> => {
        return api.get('/api/v1/supplier/get-active');
    },

    getAllSuppliers: async (): Promise<AxiosResponse<SupplierResponse[]>> => {
        return api.get(`/api/v1/supplier/get-all`);
    },

    createSupplier: async (supplierRequest: SupplierRequest): Promise<AxiosResponse<SupplierResponse>> => {
        return api.post(`/api/v1/supplier/post`, supplierRequest);
    },

    updateSupplier: async (id: number, updates: Partial<SupplierRequest>): Promise<AxiosResponse<SupplierResponse>> => {
        return api.patch(`/api/v1/supplier/patch/${id}`, updates);
    },

};