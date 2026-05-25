import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {warehouseApi} from "./warehouseApi";
import type {WarehouseRequest} from "../../../shared/types/warehouseTypes";


export const useWarehouses = () => {

    const queryClient = useQueryClient();


    const useGetAllWarehouses = () => {
        return useQuery({
            queryKey: ['warehouses-all'],
            queryFn: async () => {
                const response = await warehouseApi.getAllWarehouses();
                return response.data;
            },
            refetchOnWindowFocus: false,
        });
    };

    const useCreateWarehouse = () => {
        return useMutation({
            mutationFn: async (newWarehouse: WarehouseRequest) => {
                const response = await warehouseApi.createWarehouse(newWarehouse);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["warehouses-all"] });
            },
        });
    };

    const useUpdateWarehouse = (id: number) => {
        return useMutation({
            mutationFn: (updates: Partial<WarehouseRequest>) =>
                warehouseApi.updateWarehouse(id, updates),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["warehouses-all"] });
            },
        });
    };

    const useDeleteWarehouse = (id: number) => {
        return useMutation({
            mutationFn: () => warehouseApi.deleteWarehouse(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["warehouses-all"] });
            },
        });
    };


    return {
        useGetAllWarehouses,
        useCreateWarehouse,
        useUpdateWarehouse,
        useDeleteWarehouse,
    };
};