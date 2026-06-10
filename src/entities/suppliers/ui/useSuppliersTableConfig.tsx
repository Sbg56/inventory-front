
import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { Chip } from "@mui/material";
import {getDefaultMRTOptions} from "../../../shared/utils/defaultTableOptions";
import type {SupplierResponse} from "../../../shared/types/supplierTypes";

export const useSuppliersTableConfig = () => {

    const defaultMRTOptions = getDefaultMRTOptions<SupplierResponse>();

    const columns = useMemo<MRT_ColumnDef<SupplierResponse>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Название",
                enableSorting: true,
            },
            {
                accessorKey: "contactPerson",
                header: "Контактное лицо",
                enableSorting: true,
            },
            {
                accessorKey: "phone",
                header: "Телефон",
                enableSorting: false,
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: false,
            },
            {
                accessorKey: "inn",
                header: "ИНН",
                enableSorting: false,
            },
            {
                accessorKey: "isActive",
                header: "Статус",
                enableSorting: true,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.isActive ? "Активен" : "Неактивен"}
                        size="small"
                        sx={{
                            backgroundColor: row.original.isActive ? "#E6F4EA" : "#FCE8E6",
                            color: row.original.isActive ? "#137333" : "#C5221F",
                            fontWeight: 600,
                        }}
                    />
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