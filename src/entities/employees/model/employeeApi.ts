import api from "../../../shared/api/axios/axiosInstance";
import type { AxiosResponse } from "axios";
import type { EmployeeRequest, EmployeeResponse } from "../../../shared/types/employeeTypes";

export const employeeApi = {
    getAllEmployees: async (): Promise<AxiosResponse<EmployeeResponse[]>> => {
        return api.get("/api/v1/employee/get-all");
    },
    createEmployee: async (employeeRequest: EmployeeRequest): Promise<AxiosResponse<EmployeeResponse>> => {
        return api.post("/api/v1/employee/post", employeeRequest);
    },
    updateEmployee: async (id: number, updates: Partial<EmployeeRequest>): Promise<AxiosResponse<EmployeeResponse>> => {
        return api.patch(`/api/v1/employee/patch/${id}`, updates);
    },
    deleteEmployee: async (id: number): Promise<AxiosResponse<string>> => {
        return api.delete(`/api/v1/employee/delete/${id}`);
    },
};