import { type JSX, useState } from "react";
import * as React from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Typography, IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import type { EmployeeResponse } from "../../shared/types/employeeTypes";
import { useEmployees } from "../../entities/employees/model/useEmployees";
import { useEmployeesTableConfig } from "../../entities/employees/ui/useEmployeesTableConfig";
import CreateEmployeeModal from "./CreateEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import { usePermissions } from "../../shared/auth/usePermissions";

const EmployeeRowActions = ({
                                employee,
                                onEdit,
                                showNotification,
                            }: {
    employee: EmployeeResponse;
    onEdit: () => void;
    showNotification: (msg: string, severity: "success" | "error") => void;
}) => {
    const { useDeactivateEmployee } = useEmployees();
    const deactivateMutation = useDeactivateEmployee();
    const { canEdit, canDelete } = usePermissions();

    const handleDeactivate = (e: React.MouseEvent) => {
        e.stopPropagation();
        deactivateMutation.mutate(employee.id, {
            onSuccess: () => showNotification(`Сотрудник "${employee.name}" деактивирован`, "success"),
            onError: () => showNotification(`Ошибка при деактивации "${employee.name}"`, "error"),
        });
    };

    return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
            {canEdit && (
                <Tooltip title="Редактировать" arrow>
                    <IconButton
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        size="small"
                        sx={{ color: "#CB673C", "&:hover": { backgroundColor: "rgba(203, 103, 60, 0.08)" } }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            {canDelete && (
                <Tooltip title={employee.isActive ? "Деактивировать" : "Уже неактивен"} arrow>
                    <span>
                        <IconButton
                            onClick={handleDeactivate}
                            size="small"
                            color="error"
                            disabled={deactivateMutation.isPending || !employee.isActive}
                            sx={{ "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" } }}
                        >
                            <PersonOffIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
};

export default function EmployeeTable(): JSX.Element {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const { useGetAllEmployees } = useEmployees();
    const { data: employeesData, isLoading, isError, error } = useGetAllEmployees();

    const { columns, defaultMRTOptions } = useEmployeesTableConfig();
    const { canCreate, canEdit } = usePermissions();

    const showNotification = (msg: string, severity: "success" | "error") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: employeesData || [],
        enableRowActions: canEdit,
        positionActionsColumn: "last",
        displayColumnDefOptions: {
            "mrt-row-actions": { header: "Действие", size: 100 },
        },
        renderRowActions: ({ row }) => (
            <EmployeeRowActions
                employee={row.original}
                onEdit={() => {
                    setSelectedEmployee(row.original);
                    setIsEditModalOpen(true);
                }}
                showNotification={showNotification}
            />
        ),
        renderTopToolbarCustomActions: () => (
            canCreate ? (
                <Tooltip title="Добавить сотрудника" arrow>
                    <IconButton
                        onClick={() => setIsCreateModalOpen(true)}
                        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                        <PlaylistAddIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                </Tooltip>
            ) : null
        ),
        muiTableContainerProps: { sx: { height: "75vh" } },
    });

    if (isLoading) return <Loading content="Загрузка сотрудников..." />;

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <ErrorBlock content="Ошибка при загрузке сотрудников!" />
                <Typography color="error" sx={{ mt: 1 }}>
                    {error instanceof Error ? error.message : String(error)}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <MaterialReactTable table={table} />

            {isCreateModalOpen && (
                <CreateEmployeeModal
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {isEditModalOpen && selectedEmployee && (
                <EditEmployeeModal
                    open={isEditModalOpen}
                    employee={selectedEmployee}
                    onClose={() => { setIsEditModalOpen(false); setSelectedEmployee(null); }}
                />
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
