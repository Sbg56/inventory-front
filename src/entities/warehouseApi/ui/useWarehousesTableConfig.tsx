import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { getDefaultMRTOptions } from "../../../shared/utils/defaultTableOptions";
import type { WarehouseResponse } from "../../../shared/types/warehouseTypes";

export const useWarehousesTableConfig = () => {

    const defaultMRTOptions = getDefaultMRTOptions<WarehouseResponse>();

    const columns = useMemo<MRT_ColumnDef<WarehouseResponse>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Название склада",
                enableSorting: true,
            },
            {
                accessorKey: "address",
                header: "Адрес",
                enableSorting: true,
            },
            {
                accessorKey: "employee",
                header: "Ответственный",
                enableSorting: true,
            },
            {
                accessorKey: "description",
                header: "Описание",
                enableSorting: false,
            },
        ],
        [],
    );

    return {
        defaultMRTOptions,
        columns,
    };
};