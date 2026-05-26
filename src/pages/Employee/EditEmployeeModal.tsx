import { useState, useEffect } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper,
    FormControlLabel, Switch, MenuItem,
} from "@mui/material";
import { useEmployees } from "../../entities/employees/model/useEmployees";
import type { EmployeeResponse } from "../../shared/types/employeeTypes";

interface EditEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    employee: EmployeeResponse;
}

const STATUS_OPTIONS = [
    "Менеджер склада",
    "Кладовщик",
    "Логист",
    "Бухгалтер",
    "Администратор",
    "Другое",
];

export default function EditEmployeeModal({ open, onClose, employee }: EditEmployeeModalProps) {
    const { useUpdateEmployee } = useEmployees();
    const updateMutation = useUpdateEmployee();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "",
        isActive: true,
    });

    useEffect(() => {
        if (employee && open) {
            setFormData({
                name: employee.name ?? "",
                email: employee.email ?? "",
                phone: employee.phone ?? "",
                status: employee.status ?? "",
                isActive: employee.isActive ?? true,
            });
        }
    }, [employee, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(
            { id: employee.id, updates: formData },
            { onSuccess: () => onClose() }
        );
    };

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
                ✏️ Редактирование сотрудника
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
                                            label="Имя сотрудника"
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
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Телефон"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            label="Должность"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                        >
                                            {STATUS_OPTIONS.map(option => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isActive}
                                                    onChange={e =>
                                                        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                                                    }
                                                    sx={{
                                                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#CB673C" },
                                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#CB673C" },
                                                    }}
                                                />
                                            }
                                            label="Активен"
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