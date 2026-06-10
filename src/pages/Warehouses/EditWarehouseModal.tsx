import { useState, useEffect } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper,
    Autocomplete, CircularProgress,
} from "@mui/material";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useEmployees } from "../../entities/employees/model/useEmployees";
import type { WarehouseResponse } from "../../shared/types/warehouseTypes";

interface EditWarehouseModalProps {
    open: boolean;
    onClose: () => void;
    warehouse: WarehouseResponse;
}

export default function EditWarehouseModal({ open, onClose, warehouse }: EditWarehouseModalProps) {
    const { useUpdateWarehouse } = useWarehouses();
    const updateMutation = useUpdateWarehouse();

    const { useGetAllEmployees } = useEmployees();
    const { data: employees, isLoading: employeesLoading } = useGetAllEmployees();

    const [formData, setFormData] = useState<{
        name: string;
        address: string;
        employeeId: number | null;
        description: string;
    }>({
        name: "",
        address: "",
        employeeId: null,
        description: "",
    });

    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        if (warehouse && open && employees) {
            const matched = employees.find(emp => emp.name === warehouse.employeeName) ?? null;
            setSelectedEmployee(matched ? { id: matched.id, name: matched.name } : null);
            setFormData({
                name: warehouse.name ?? "",
                address: warehouse.address ?? "",
                employeeId: matched?.id ?? null,
                description: warehouse.description ?? "",
            });
        }
    }, [warehouse, open, employees]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(
            { id: warehouse.id, updates: formData },
            { onSuccess: () => onClose() }
        );
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
                                        <Autocomplete
                                            options={activeEmployees}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedEmployee}
                                            loading={employeesLoading}
                                            onChange={(_event, newValue) => {
                                                setSelectedEmployee(newValue);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    employeeId: newValue?.id ?? null,
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
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