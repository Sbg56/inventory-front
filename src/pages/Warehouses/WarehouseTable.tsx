import { type JSX, useState } from "react";
import * as React from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Typography, IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { usePermissions } from '../../shared/auth/usePermissions';
import { useWarehousesTableConfig } from "../../entities/warehouseApi/ui/useWarehousesTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import CreateWarehouseModal from "../Warehouses/CreateWarehouseModal";
import EditWarehouseModal from "../Warehouses/EditWarehouseModal";
import type { WarehouseResponse } from "../../shared/types/warehouseTypes";

const WarehouseRowActions = ({
                                 warehouse,
                                 onEdit,
                                 showNotification,
                             }: {
    warehouse: WarehouseResponse;
    onEdit: () => void;
    showNotification: (msg: string, severity: "success" | "error") => void;
}) => {
    const { useDeleteWarehouse } = useWarehouses();
    const deleteMutation = useDeleteWarehouse();
    const { canEdit, canDelete } = usePermissions();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteMutation.mutate(warehouse.id, {
            onSuccess: () => showNotification(`Склад "${warehouse.name}" успешно удалён`, "success"),
            onError: () => showNotification(`Ошибка при удалении склада "${warehouse.name}"`, "error"),
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
                <Tooltip title="Удалить" arrow>
                    <IconButton
                        onClick={handleDelete}
                        size="small"
                        color="error"
                        disabled={deleteMutation.isPending}
                        sx={{ "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" } }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default function WarehouseTable(): JSX.Element {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseResponse | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehousesData, isLoading, isError, error } = useGetAllWarehouses();

    const { columns, defaultMRTOptions } = useWarehousesTableConfig();
    const { canCreate, canEdit } = usePermissions();

    const showNotification = (msg: string, severity: "success" | "error") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: warehousesData || [],
        enableRowActions: canEdit,
        positionActionsColumn: "last",
        displayColumnDefOptions: {
            "mrt-row-actions": { header: "Действие", size: 100 },
        },
        renderRowActions: ({ row }) => (
            <WarehouseRowActions
                warehouse={row.original}
                onEdit={() => {
                    setSelectedWarehouse(row.original);
                    setIsEditModalOpen(true);
                }}
                showNotification={showNotification}
            />
        ),
        renderTopToolbarCustomActions: () => (
            canCreate ? (
                <Tooltip title="Добавить склад" arrow>
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

    if (isLoading) return <Loading content="Загрузка складов..." />;

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <ErrorBlock content="Ошибка при загрузке складов!" />
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
                <CreateWarehouseModal
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {isEditModalOpen && selectedWarehouse && (
                <EditWarehouseModal
                    open={isEditModalOpen}
                    warehouse={selectedWarehouse}
                    onClose={() => { setIsEditModalOpen(false); setSelectedWarehouse(null); }}
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