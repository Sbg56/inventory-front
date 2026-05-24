import { useQuery } from "@tanstack/react-query";
import {warehouseApi} from "./warehouseApi";


export const useWarehouses = () => {
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

    return { useGetAllWarehouses };
};