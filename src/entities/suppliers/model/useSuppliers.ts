import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {supplierApi} from "./supplierApi";
import type {SupplierRequest} from "../../../shared/types/supplierTypes";


export const useSuppliers = () => {

    const queryClient = useQueryClient();

    const useGetActiveSuppliers = () => {
        return useQuery({
            queryKey: ['suppliers-active'],
            queryFn: async () => {
                const response = await supplierApi.getActiveSuppliers();
                return response.data;
            },
            refetchOnWindowFocus: false,
        });
    };

    const useGetAllSuppliers = () => {
        return useQuery({
            queryKey: ["suppliers-all"],
            queryFn: async () => {
                const response = await supplierApi.getAllSuppliers();
                return response.data;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });
    };


    const useCreateSupplier = () => {
        return useMutation({
            mutationFn: async (newSupplier: SupplierRequest) => {
                const response = await supplierApi.createSupplier(newSupplier);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["suppliers-all"] });
                queryClient.invalidateQueries({ queryKey: ["suppliers-active"] });
            },
        });
    };

    const useUpdateSupplier = (id: number) => {
        return useMutation({
            mutationFn: (updates: Partial<SupplierRequest>) =>
                supplierApi.updateSupplier(id, updates),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["suppliers-all"] });
                queryClient.invalidateQueries({ queryKey: ["suppliers-active"] });
            },
        });
    };


    return {
        useGetActiveSuppliers,
        useGetAllSuppliers,
        useUpdateSupplier,
        useCreateSupplier
    };
};