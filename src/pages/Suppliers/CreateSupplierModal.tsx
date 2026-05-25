import { useState } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Paper,
    FormControlLabel, Switch
} from "@mui/material";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import type { SupplierRequest } from "../../shared/types/supplierTypes";

interface CreateSupplierModalProps {
    open: boolean;
    onClose: () => void;
}

const emptyForm: SupplierRequest = {
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    inn: "",
    notes: "",
    isActive: true,
};

export default function CreateSupplierModal({ open, onClose }: CreateSupplierModalProps) {
    const { useCreateSupplier } = useSuppliers();
    const createMutation = useCreateSupplier();

    const [formData, setFormData] = useState<SupplierRequest>(emptyForm);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isActive: e.target.checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData, {
            onSuccess: () => {
                setFormData(emptyForm);
                onClose();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: { sx: { borderRadius: "12px", background: "#FDFDFD" } },
            }}
        >
            <DialogTitle
                sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "1.5rem", borderBottom: "1px solid #eee", mb: 2 }}
            >
                🤝 Новый поставщик
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pb: 3, pt: 1 }}>
                    <Grid container spacing={3}>

                        {/* Основная информация */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Основная информация</SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <TextField label="Название компании" name="name" value={formData.name} onChange={handleChange} fullWidth required size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="ИНН" name="inn" value={formData.inn} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField label="Контактное лицо" name="contactPerson" value={formData.contactPerson} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isActive}
                                                    onChange={handleSwitchChange}
                                                    sx={{
                                                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#CB673C" },
                                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#CB673C" },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ color: formData.isActive ? "#137333" : "#C5221F", fontWeight: 600 }}>
                                                    {formData.isActive ? "Активен" : "Неактивен"}
                                                </Typography>
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Контактные данные */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Контактные данные</SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Телефон" name="phone" value={formData.phone} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Адрес" name="address" value={formData.address} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Примечания */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Примечания</SectionTitle>
                                <TextField label="Дополнительные заметки" name="notes" value={formData.notes} onChange={handleChange} fullWidth multiline rows={3} size="small" />
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
                        {createMutation.isPending ? "Сохранение..." : "Сохранить поставщика"}
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
        <Typography sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", mb: 2, letterSpacing: "0.5px" }}>
            {children}
        </Typography>
    );
}