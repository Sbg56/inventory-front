import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { Typography } from "@mui/material";
import {getDefaultMRTOptions} from "../../../shared/utils/defaultTableOptions";

export interface ProductResponse {
    id: number;
    sku: string;
    name: string;
    description: string;
    categoryName: string;
    supplierName: string;
    unit: string;
    weight: number;
    volume: number;
    minStock: number;
    maxStock: number;
    location: string;
    barcode: string;
    notes: string;
    isActive: boolean;
}

export const useProductsTableConfig = () => {

    const defaultMRTOptions = getDefaultMRTOptions<ProductResponse>();

    const columns = useMemo<MRT_ColumnDef<ProductResponse>[]>(
        () => [
            {
                accessorKey: "sku",
                header: 'Артикул (SKU)',
                enableSorting: true,
            },
            {
                accessorKey: "name",
                header: 'Наименование',
                enableSorting: true,
            },
            {
                accessorKey: "categoryName",
                header: 'Категория',
            },
            {
                accessorKey: "supplierName",
                header: 'Поставщик',
            },
            {
                accessorKey: "barcode",
                header: 'Штрих-код',
            },
            {
                accessorKey: "location",
                header: 'Место хранения',
            },
            {

                accessorKey: "stockInfo",
                header: 'Остатки (Мин / Макс)',
                Cell: ({ row }) => (
                    <Typography variant="body2">
                        {row.original.minStock} / {row.original.maxStock} {row.original.unit}
                    </Typography>
                ),
            },
        ],
        [],
    );

    return {
        defaultMRTOptions,
        columns,
    };
};