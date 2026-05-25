import { useState, useEffect } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper
} from "@mui/material";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import type { WarehouseResponse } from "../../shared/types/warehouseTypes";

interface EditWarehouseModalProps {
    open: boolean;
    onClose: () => void;
    warehouse: WarehouseResponse;
}

export default function EditWarehouseModal({ open, onClose, warehouse }: EditWarehouseModalProps) {
    const { useUpdateWarehouse } = useWarehouses();
    const updateMutation = useUpdateWarehouse(warehouse.id);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        employee: "",
        description: "",
    });

    useEffect(() => {
        if (warehouse && open) {
            setFormData({
                name: warehouse.name ?? "",
                address: warehouse.address ?? "",
                employee: warehouse.employee ?? "",
                description: warehouse.description ?? "",
            });
        }
    }, [warehouse, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: { borderRadius: "12px", background: "#FDFDFD" },
                },
            }}
        >
            <DialogTitle
                sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "1.4rem", borderBottom: "1px solid #eee", pb: 1.5 }}
            >
                ✏️ Редактирование склада
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pb: 3, pt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Основная информация</SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Название склада"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            fullWidth
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Адрес"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Ответственный сотрудник"
                                            name="employee"
                                            value={formData.employee}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Описание"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, backgroundColor: "#F9F9F9", borderTop: "1px solid #EDEDED" }}>
                    <Button onClick={onClose} sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}>
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updateMutation.isPending}
                        sx={{
                            backgroundColor: "#CB673C",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                            borderRadius: "6px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#A04E2B", boxShadow: "none" },
                        }}
                    >
                        {updateMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

const sectionPaper = {
    p: 2.5,
    borderLeft: "5px solid #CB673C",
    borderRadius: "4px 8px 8px 4px",
    bgcolor: "#FAFAFA",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", mb: 1.5, letterSpacing: "0.5px" }}
        >
            {children}
        </Typography>
    );
}