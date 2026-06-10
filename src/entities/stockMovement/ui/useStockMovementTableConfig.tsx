import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { getDefaultMRTOptions } from "../../../shared/utils/defaultTableOptions";
import type { StockMovementResponse } from "../../../shared/types/stockMovementTypes";
import { Typography } from "@mui/material";

export const useStockMovementTableConfig = () => {
    const defaultMRTOptions = getDefaultMRTOptions<StockMovementResponse>();

    const columns = useMemo<MRT_ColumnDef<StockMovementResponse>[]>(
        () => [
            {
                accessorKey: "movementDate",
                header: "Дата",
                Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString("ru-RU"),
            },
            {
                accessorKey: "documentNumber",
                header: "Номер документа",
            },
            {
                accessorKey: "fromWarehouseName",
                header: "Откуда",
                Cell: ({ cell }) => cell.getValue<string>() || "—",
            },
            {
                accessorKey: "toWarehouseName",
                header: "Куда",
                Cell: ({ cell }) => cell.getValue<string>() || "—",
            },
            {
                accessorKey: "quantity",
                header: "Кол-во",
                Cell: ({ cell }) => (
                    <Typography sx={{ fontWeight: 600 }}>{cell.getValue<number>()}</Typography>
                ),
            },
            {
                accessorKey: "price",
                header: "Цена",
            },
            {
                accessorKey: "totalAmount",
                header: "Сумма",
                Cell: ({ cell }) => (
                    <Typography sx={{ fontWeight: 600, color: "#137333" }}>
                        {cell.getValue<number>()}
                    </Typography>
                ),
            },
        ],
        []
    );

    return { defaultMRTOptions, columns };
};