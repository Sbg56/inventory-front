import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { getDefaultMRTOptions } from "../../../../../../Downloads/inventory-front-fixed/inventory-front-fixed/src/shared/utils/defaultTableOptions";
import type { OrderResponse, SupplierOrderResponse } from "../../../../../../Downloads/inventory-front-fixed/inventory-front-fixed/src/shared/types/tradeTypes";

type TradeRow = OrderResponse | SupplierOrderResponse;

export const useTradeTableConfig = (isSale: boolean) => {
    const defaultMRTOptions = getDefaultMRTOptions<TradeRow>();

    const columns = useMemo<MRT_ColumnDef<TradeRow>[]>(() => {
        const base: MRT_ColumnDef<TradeRow>[] = [
            {
                accessorKey: "documentNumber",
                header: "Номер документа",
                muiTableBodyCellProps: { sx: { fontWeight: 600, color: "#422112" } },
            },
            {
                accessorKey: "createdAt",
                header: "Дата",
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    return value
                        ? new Date(value).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "—";
                },
            },
        ];

        if (isSale) {
            base.push({
                accessorKey: "customerName",
                header: "Покупатель (Клиент)",
                Cell: ({ cell }) => (cell.getValue<string>() as string) || "—",
            });
        } else {
            base.push(
                {
                    accessorKey: "supplierName",
                    header: "Поставщик",
                    Cell: ({ cell }) => (cell.getValue<string>() as string) || "—",
                },
                {
                    accessorKey: "warehouseName",
                    header: "Склад поступления",
                    Cell: ({ cell }) => (cell.getValue<string>() as string) || "—",
                }
            );
        }

        base.push(
            {
                accessorKey: "totalAmount",
                header: "Сумма",
                Cell: ({ cell }) => {
                    const value = cell.getValue<number>();
                    return `${value?.toLocaleString("ru-RU") ?? 0} ₽`;
                },
                muiTableBodyCellProps: {
                    sx: { fontWeight: 700, color: isSale ? "#1565C0" : "#137333" },
                },
            },
            {
                accessorKey: "notes",
                header: "Примечание",
                Cell: ({ cell }) => (cell.getValue<string>() as string) || "—",
            }
        );

        return base;
    }, [isSale]);

    return { defaultMRTOptions, columns };
};
