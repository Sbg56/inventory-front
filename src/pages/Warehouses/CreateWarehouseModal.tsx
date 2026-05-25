import { useState } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper
} from "@mui/material";
import {useWarehouses} from "../../entities/warehouseApi/model/useWarehouses";
import type {WarehouseRequest} from "../../shared/types/warehouseTypes";


interface CreateWarehouseModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateWarehouseModal({ open, onClose }: CreateWarehouseModalProps) {
    const { useCreateWarehouse } = useWarehouses();
    const createMutation = useCreateWarehouse();

    const [formData, setFormData] = useState<WarehouseRequest>({
        name: "",
        address: "",
        employee: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData, {
            onSuccess: () => {
                setFormData({ name: "", address: "", employee: "", description: "" });
                onClose();
            },
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
                sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "1.5rem", borderBottom: "1px solid #eee", mb: 2 }}
            >
                🏭 Новый склад
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pb: 3, pt: 1 }}>
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

                <DialogActions sx={{ p: 3, pt: 1, backgroundColor: "#F9F9F9", borderTop: "1px solid #EDEDED" }}>
                    <Button onClick={onClose} sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}>
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createMutation.isPending}
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
                        {createMutation.isPending ? "Сохранение..." : "Сохранить склад"}
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
            sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", mb: 2, letterSpacing: "0.5px" }}
        >
            {children}
        </Typography>
    );
}