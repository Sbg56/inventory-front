// src/pages/Products/EditProductModal.tsx
import { useState, useEffect } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select,
    MenuItem, type SelectChangeEvent, Grid, Typography, Paper,
    Switch, FormControlLabel
} from "@mui/material";

import { useCategories } from "../../entities/category/model/useCategories";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import type { ProductResponse } from "../../shared/types/productTypes";

interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    product: ProductResponse;
}

type EditableFields = {
    sku: string;
    name: string;
    description: string;
    notes: string;
    barcode: string;
    unit: string;
    weight: number | "";
    volume: number | "";
    minStock: number | "";
    maxStock: number | "";
    category: number | "";    // ключ для бэка
    supplier: number | "";    // ключ для бэка
    warehouses: number | "";  // ключ для бэка — поле в Product называется warehouses
    isActive: boolean;
};

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
    const { useGetAllCategories } = useCategories();
    const { data: categories = [] } = useGetAllCategories();

    const { useGetActiveSuppliers } = useSuppliers();
    const { data: suppliers = [] } = useGetActiveSuppliers();

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehouses = [] } = useGetAllWarehouses();

    const { useUpdateProduct } = useGetProducts();
    const updateMutation = useUpdateProduct(product.id);

    const [formData, setFormData] = useState<EditableFields>({
        sku: "",
        name: "",
        description: "",
        notes: "",
        barcode: "",
        unit: "",
        weight: "",
        volume: "",
        minStock: "",
        maxStock: "",
        category: "",
        supplier: "",
        warehouses: "",
        isActive: true,
    });

    useEffect(() => {
        if (product && open && categories.length > 0 && suppliers.length > 0 && warehouses.length > 0) {

            // Если в product нет готового ID, ищем объект с таким же name в массиве категорий
            const catId = product.categoryId ?? categories.find(c => c.name === product.categoryName)?.id ?? "";
            const supId = product.supplierId ?? suppliers.find(s => s.name === product.supplierName)?.id ?? "";
            const whId = product.warehouseId ?? warehouses.find(w => w.name === product.warehouseName)?.id ?? "";

            setFormData({
                sku: product.sku ?? "",
                name: product.name ?? "",
                description: product.description ?? "",
                notes: product.notes ?? "",
                barcode: product.barcode ?? "",
                unit: product.unit ?? "",
                weight: product.weight ?? "",
                volume: product.volume ?? "",
                minStock: product.minStock ?? "",
                maxStock: product.maxStock ?? "",
                category: catId,
                supplier: supId,
                warehouses: whId,
                isActive: product.isActive ?? true,
            });
        }
    }, [product, open, categories, suppliers, warehouses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
        }));
    };

    // 🌟 Изменили тип на any/unknown внутри события, чтобы заглушить конфликты типов MUI Select в TS
    const handleSelectChange = (e: SelectChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isActive: e.target.checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Record<string, unknown> = {
            sku: formData.sku,
            name: formData.name,
            description: formData.description,
            notes: formData.notes,
            barcode: formData.barcode,
            unit: formData.unit,
            isActive: formData.isActive,
        };

        if (formData.weight !== "")    payload.weight    = formData.weight;
        if (formData.volume !== "")    payload.volume    = formData.volume;
        if (formData.minStock !== "")  payload.minStock  = formData.minStock;
        if (formData.maxStock !== "")  payload.maxStock  = formData.maxStock;
        if (formData.category !== "")  payload.category  = formData.category;
        if (formData.supplier !== "")  payload.supplier  = formData.supplier;
        if (formData.warehouses !== "") payload.warehouses = formData.warehouses;

        updateMutation.mutate(payload as never, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg" // 🌟 Увеличили до lg, чтобы на десктопе две колонки имели много пространства
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "12px",
                        background: "#FDFDFD",
                    },
                },
            }}
        >
            <DialogTitle sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "1.4rem", borderBottom: "1px solid #eee", pb: 1.5 }}>
                ✏️ Редактирование товара
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                {/* 🌟 Ограничиваем высоту контента до 65% экрана и включаем внутренний скроллбар для 1080p */}
                <DialogContent dividers sx={{ pb: 2, pt: 2, maxHeight: "65vh", overflowY: "auto" }}>

                    {/* Главная сетка: разделяет модалку на 2 большие колонки на экранах от md и выше */}
                    <Grid container spacing={2}>

                        {/* ЛЕВАЯ КОЛОНКА (Основное, Классификация, Описание) — занимает 7 из 12 долей */}
                        <Grid item xs={12} md={7}>
                            <Grid container spacing={2}>

                                {/* Основная информация */}
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={sectionPaper}>
                                        <SectionTitle>Основная информация</SectionTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField label="Наименование товара" name="name" value={formData.name} onChange={handleChange} fullWidth required size="small" />
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <TextField label="Артикул (SKU)" name="sku" value={formData.sku} onChange={handleChange} fullWidth required size="small" />
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <TextField label="Штрих-код" name="barcode" value={formData.barcode} onChange={handleChange} fullWidth size="small" />
                                            </Grid>
                                            <Grid item xs={12}>
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

                                {/* Классификация и снабжение */}
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={sectionPaper}>
                                        <SectionTitle>Классификация и снабжение</SectionTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth required size="small">
                                                    <InputLabel>Категория</InputLabel>
                                                    <Select name="category" value={formData.category} onChange={handleSelectChange} label="Категория">
                                                        {categories.map(cat => (
                                                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth required size="small">
                                                    <InputLabel>Поставщик</InputLabel>
                                                    <Select name="supplier" value={formData.supplier} onChange={handleSelectChange} label="Поставщик">
                                                        {suppliers.map(sup => (
                                                            <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Склад размещения</InputLabel>
                                                    <Select name="warehouses" value={formData.warehouses} onChange={handleSelectChange} label="Склад размещения">
                                                        {warehouses.map(wh => (
                                                            <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Описание и примечания */}
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={sectionPaper}>
                                        <SectionTitle>Описание и примечания</SectionTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField label="Описание товара" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} size="small" />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField label="Дополнительные заметки" name="notes" value={formData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                            </Grid>
                        </Grid>

                        {/* ПРАВАЯ КОЛОНКА (Физические параметры, Лимиты запасов) — занимает 5 из 12 долей */}
                        <Grid item xs={12} md={5}>
                            <Grid container spacing={2}>

                                {/* Физические параметры */}
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={sectionPaper}>
                                        <SectionTitle>Физические параметры</SectionTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField label="Ед. изм." name="unit" value={formData.unit} onChange={handleChange} fullWidth size="small" />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField label="Вес (кг)" name="weight" type="number" value={formData.weight} onChange={handleChange} fullWidth size="small" />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField label="Объем (м³)" name="volume" type="number" value={formData.volume} onChange={handleChange} fullWidth size="small" />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Лимиты запасов */}
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ ...sectionPaper, borderColor: "#F5DBCF" }}>
                                        <SectionTitle>Лимиты запасов</SectionTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField label="Минимальный порог" name="minStock" type="number" value={formData.minStock} onChange={handleChange} fullWidth size="small" inputProps={{ min: 0 }} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField label="Максимальный лимит" name="maxStock" type="number" value={formData.maxStock} onChange={handleChange} fullWidth size="small" inputProps={{ min: 0 }} />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                            </Grid>
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
    p: 2,
    borderLeft: "5px solid #CB673C",
    borderRadius: "4px 8px 8px 4px",
    bgcolor: "#FAFAFA",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", mb: 1.5, letterSpacing: "0.5px" }}>
            {children}
        </Typography>
    );
}