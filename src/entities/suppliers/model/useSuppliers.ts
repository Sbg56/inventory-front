import { useQuery } from "@tanstack/react-query";
import {supplierApi} from "./supplierApi";


export const useSuppliers = () => {
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

    return { useGetActiveSuppliers };
};