
import { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select,
    MenuItem, type SelectChangeEvent, Grid, Typography, Paper
} from "@mui/material";

import {useCategories} from "../../entities/category/model/useCategories";
import {useSuppliers} from "../../entities/suppliers/model/useSuppliers";
import {useWarehouses} from "../../entities/warehouseApi/model/useWarehouses";
import {useGetProducts} from "../../entities/products/model/useGetProducts";
import type {ProductRequest} from "../../shared/types/productTypes";
import * as React from "react";

interface CreateProductModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateProductModal({ open, onClose }: CreateProductModalProps) {
    const { useGetAllCategories } = useCategories();
    const { data: categories = [] } = useGetAllCategories();

    const { useGetActiveSuppliers } = useSuppliers();
    const { data: suppliers = [] } = useGetActiveSuppliers();

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehouses = [] } = useGetAllWarehouses();

    const { useCreateProduct } = useGetProducts();
    const createProductMutation = useCreateProduct();

    const [formData, setFormData] = useState<ProductRequest>({
        sku: "",
        name: "",
        description: "",
        categoryId: 0,
        supplierId: 0,
        unit: "шт",
        weight: 0,
        volume: 0,
        barcode: "",
        notes: "",
        warehouseId: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProductMutation.mutate(formData, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '12px',
                        background: '#FDFDFD',
                        overflow: 'visible'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                color: '#A04E2B',
                fontWeight: 700,
                fontSize: '1.5rem',
                borderBottom: '1px solid #eee',
                mb: 2
            }}>
                📦 Карточка нового продукта
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pb: 3, pt: 1, overflow: 'visible' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '5px solid #CB673C', borderRadius: '4px 8px 8px 4px', bg: '#FAFAFA' }}>
                                <Typography sx={{ color: '#A04E2B', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', mb: 2, letterSpacing: '0.5px' }}>
                                    Основная информация
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField label="Наименование товара" name="name" value={formData.name} onChange={handleChange} fullWidth required size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField label="Артикул (SKU)" name="sku" value={formData.sku} onChange={handleChange} fullWidth required size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField label="Штрих-код" name="barcode" value={formData.barcode} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} >
                            <Paper variant="outlined" sx={{p: 2.5, borderLeft: '5px solid #CB673C', borderRadius: '4px 8px 8px 4px', bgcolor: '#FAFAFA', overflow: 'visible', width: '100%', boxSizing: 'border-box' }}>
                                <Typography sx={{ color: '#A04E2B', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', mb: 2, letterSpacing: '0.5px' }}>
                                    Классификация и снабжение
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth required size="small" sx={{ minWidth: 150, width: '100%' }}>
                                            <InputLabel>Категория</InputLabel>
                                            <Select name="categoryId" value={formData.categoryId || ""} onChange={handleSelectChange} label="Категория">
                                                {categories.map(cat => (
                                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth required size="small" sx={{ minWidth: 150, width: '100%' }}>
                                            <InputLabel>Поставщик</InputLabel>
                                            <Select name="supplierId" value={formData.supplierId || ""} onChange={handleSelectChange} label="Поставщик">
                                                {suppliers.map(sup => (
                                                    <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth required size="small" sx={{ minWidth: 220, width: '100%' }}>
                                            <InputLabel>Склад размещения</InputLabel>
                                            <Select name="warehouseId" value={formData.warehouseId || ""} onChange={handleSelectChange} label="Склад размещения">
                                                {warehouses.map(wh => (
                                                    <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '5px solid #CB673C', borderRadius: '4px 8px 8px 4px', bg: '#FAFAFA' }}>
                                <Typography sx={{ color: '#A04E2B', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', mb: 2, letterSpacing: '0.5px' }}>
                                    Физические параметры
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <TextField label="Ед. измерения" name="unit" value={formData.unit} onChange={handleChange} fullWidth size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={4.5}>
                                        <TextField label="Вес единицы (кг)" name="weight" type="number" value={formData.weight || ""} onChange={handleChange} fullWidth size="small"/>
                                    </Grid>
                                    <Grid item xs={12} md={4.5}>
                                        <TextField label="Объем единицы (м³)" name="volume" type="number" value={formData.volume || ""} onChange={handleChange} fullWidth size="small"/>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '5px solid #CB673C', borderRadius: '4px 8px 8px 4px', bg: '#FAFAFA' }}>
                                <Typography sx={{ color: '#A04E2B', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', mb: 2, letterSpacing: '0.5px' }}>
                                    Описание и примечания
                                </Typography>
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
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, backgroundColor: '#F9F9F9', borderTop: '1px solid #EDEDED' }}>
                    <Button onClick={onClose} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createProductMutation.isPending}
                        sx={{
                            backgroundColor: '#CB673C',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            borderRadius: '6px',
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#A04E2B', boxShadow: 'none' }
                        }}
                    >
                        {createProductMutation.isPending ? "Сохранение..." : "Сохранить товар"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}