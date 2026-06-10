import { useState } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper,
    Autocomplete, CircularProgress,
} from "@mui/material";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";

import type { WarehouseRequest } from "../../shared/types/warehouseTypes";
import {useEmployees} from "../../entities/employees/model/useEmployees";

interface CreateWarehouseModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateWarehouseModal({ open, onClose }: CreateWarehouseModalProps) {
    const { useCreateWarehouse } = useWarehouses();
    const createMutation = useCreateWarehouse();

    const { useGetAllEmployees } = useEmployees();
    const { data: employees, isLoading: employeesLoading } = useGetAllEmployees();

    const [formData, setFormData] = useState<WarehouseRequest>({
        name: "",
        address: "",
        employeeId: 0,
        description: "",
    });

    // Выбранный сотрудник для Autocomplete
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData, {
            onSuccess: () => {
                setFormData({ name: "", address: "", employeeId: 0, description: "" });
                setSelectedEmployee(null);
                onClose();
            },
        });
    };

    const activeEmployees = (employees ?? []).filter(emp => emp.isActive);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: { sx: { borderRadius: "12px", background: "#FDFDFD" } },
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
                                        <Autocomplete
                                            options={activeEmployees}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedEmployee}
                                            loading={employeesLoading}
                                            onChange={(_event, newValue) => {
                                                setSelectedEmployee(newValue);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    employeeId: newValue?.id ?? 0,
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField sx={{ minWidth: 320, width: '100%' }}
                                                    {...params}
                                                    label="Ответственный сотрудник"
                                                    size="small"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {employeesLoading && <CircularProgress color="inherit" size={16} />}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            noOptionsText="Сотрудники не найдены"
                                            loadingText="Загрузка..."
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