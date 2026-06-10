import { useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import { usePermissions } from '../../shared/auth/usePermissions';
import { useSuppliersTableConfig } from "../../entities/suppliers/ui/useSuppliersTableConfig";
import CreateSupplierModal from "./CreateSupplierModal";
import {EditSupplierModal} from "./EditSupplierModal";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import type { SupplierResponse } from "../../shared/types/supplierTypes";

export default function SupplierTable() {
    const { useGetAllSuppliers } = useSuppliers();
    const { data: suppliers = [], isLoading, isError, error } = useGetAllSuppliers();
    const { columns, defaultMRTOptions } = useSuppliersTableConfig();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);
    const { canCreate, canEdit } = usePermissions();

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: suppliers,
        state: {
            isLoading,
        },
        enableRowActions: canEdit,
        positionActionsColumn: "last",
        renderRowActions: ({ row }) => (
            canEdit ? (
                <Box sx={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="Редактировать">
                        <IconButton
                            onClick={() => setEditingSupplier(row.original)}
                            sx={{ color: "#757575", "&:hover": { color: "#CB673C" } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : null
        ),
        renderTopToolbarCustomActions: () => (
            canCreate ? (
                <IconButton
                    onClick={() => setIsCreateModalOpen(true)}
                    sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                >
                    <PlaylistAddIcon sx={{ fontSize: 28 }} />
                </IconButton>
            ) : null
        ),
    });

    if (isLoading) {
        return <Loading content={"Загрузка поставщиков..."} />;
    }

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <ErrorBlock content={"Ошибка при загрузке поставщиков!"} />
                <Typography color="error" sx={{ mt: 1 }}>
                    {error instanceof Error ? error.message : String(error)}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <MaterialReactTable table={table} />

            <CreateSupplierModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {editingSupplier && (
                <EditSupplierModal
                    open={!!editingSupplier}
                    onClose={() => setEditingSupplier(null)}
                    supplier={editingSupplier}
                />
            )}
        </>
    );
}