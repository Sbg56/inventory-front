import { useMemo } from "react";
import { Chip } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { getDefaultMRTOptions } from "../../../shared/utils/defaultTableOptions";
import type { EmployeeResponse } from "../../../shared/types/employeeTypes";

export const useEmployeesTableConfig = () => {
    const defaultMRTOptions = getDefaultMRTOptions<EmployeeResponse>();

    const columns = useMemo<MRT_ColumnDef<EmployeeResponse>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Имя сотрудника",
                enableSorting: true,
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
            },
            {
                accessorKey: "phone",
                header: "Телефон",
                enableSorting: false,
            },
            {
                accessorKey: "status",
                header: "Должность",
                enableSorting: true,
            },
            {
                accessorKey: "isActive",
                header: "Активен",
                enableSorting: true,
                Cell: ({ cell }) =>
                    cell.getValue<boolean>() ? (
                        <Chip label="Активен" size="small" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }} />
                    ) : (
                        <Chip label="Неактивен" size="small" sx={{ backgroundColor: "#fce4ec", color: "#c62828", fontWeight: 600 }} />
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