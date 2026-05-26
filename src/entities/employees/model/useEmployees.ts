import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "./employeeApi";
import type { EmployeeRequest } from "../../../shared/types/employeeTypes";

export const useEmployees = () => {
    const queryClient = useQueryClient();

    const useGetAllEmployees = () => {
        return useQuery({
            queryKey: ["employees-all"],
            queryFn: async () => {
                const response = await employeeApi.getAllEmployees();
                return response.data;
            },
            refetchOnWindowFocus: false,
        });
    };

    const useCreateEmployee = () => {
        return useMutation({
            mutationFn: async (newEmployee: EmployeeRequest) => {
                const response = await employeeApi.createEmployee(newEmployee);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["employees-all"] });
            },
        });
    };

    const useUpdateEmployee = () => {
        return useMutation({
            mutationFn: async ({ id, updates }: { id: number; updates: Partial<EmployeeRequest> }) => {
                const response = await employeeApi.updateEmployee(id, updates);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["employees-all"] });
            },
        });
    };

    // "Удаление" = деактивация (isActive: false)
    const useDeactivateEmployee = () => {
        return useMutation({
            mutationFn: async (id: number) => {
                const response = await employeeApi.updateEmployee(id, { isActive: false });
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["employees-all"] });
            },
        });
    };

    return {
        useGetAllEmployees,
        useCreateEmployee,
        useUpdateEmployee,
        useDeactivateEmployee,
    };
};