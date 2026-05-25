import { useState, useEffect } from "react";
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, FormControl, InputLabel,
    Select, MenuItem, Paper, Snackbar, Alert
} from "@mui/material";

import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useCategories } from "../../entities/category/model/useCategories";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import type { StockMovementRequest } from "../../shared/types/stockMovementTypes";
import {useStockMovements} from "../../entities/stockMovement/model/useStockMovements";

interface CreateStockMovementModalProps {
    open: boolean;
    onClose: () => void;
    preselectedCategoryId?: number | null;
    preselectedProductId?: number | null;
}

export default function CreateStockMovementModal({
                                                     open,
                                                     onClose,
                                                     preselectedCategoryId,
                                                     preselectedProductId
                                                 }: CreateStockMovementModalProps) {

    const { useCreateMovement } = useStockMovements();
    const createMutation = useCreateMovement();

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehouses = [] } = useGetAllWarehouses();

    const { useGetAllCategories } = useCategories();
    const { data: categories = [] } = useGetAllCategories();

    const [modalCategoryId, setModalCategoryId] = useState<number | "">("");

    const { useGetActiveProductsByCategory } = useGetProducts();
    const { data: products = [], isLoading: isProductsLoading } = useGetActiveProductsByCategory(
        Number(modalCategoryId),
        !!modalCategoryId
    );

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [formData, setFormData] = useState<StockMovementRequest>({
        documentNumber: "",
        productId: "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: "",
        price: "",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            setModalCategoryId(preselectedCategoryId || "");
            setFormData(prev => ({
                ...prev,
                productId: preselectedProductId || "",
                documentNumber: "",
                fromWarehouseId: "",
                toWarehouseId: "",
                quantity: "",
                price: "",
                notes: "",
            }));
        }
    }, [open, preselectedCategoryId, preselectedProductId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleCategoryChange = (catId: number) => {
        setModalCategoryId(catId);
        setFormData(prev => ({ ...prev, productId: "" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createMutation.mutate(formData as StockMovementRequest, {
            onSuccess: () => {
                onClose();
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || (
                    <>
                        Проверьте указанное количество товаров
                        <br />
                        Нельзя выходить за пределы лимитов товара
                    </>
                );

                setSnackbarMessage(errorMessage);
                setSnackbarOpen(true);
            }
        });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid #EDEDED", pb: 2, color: '#A04E2B' }}>
                    Создать перемещение товара
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3, backgroundColor: "#F9F9F9" }}>
                        <Paper sx={{ p: 2.5, borderLeft: "5px solid #CB673C", borderRadius: "4px 8px 8px 4px", boxShadow: "none" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField required label="Номер документа" name="documentNumber" value={formData.documentNumber} onChange={handleChange} fullWidth size="small" />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small" required>
                                        <InputLabel>Категория</InputLabel>
                                        <Select value={modalCategoryId} onChange={(e) => handleCategoryChange(e.target.value as number)} label="Категория">
                                            {categories.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small" required disabled={!modalCategoryId || isProductsLoading}>
                                        <InputLabel>{isProductsLoading ? "Загрузка товаров..." : "Товар"}</InputLabel>
                                        <Select name="productId" value={formData.productId} onChange={handleChange as any} label={isProductsLoading ? "Загрузка товаров..." : "Товар"}>
                                            {products.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Откуда (Склад)</InputLabel>
                                        <Select name="fromWarehouseId" value={formData.fromWarehouseId} onChange={handleChange as any} label="Откуда (Склад)">
                                            <MenuItem value=""><em>Нет (Приход / Поступление)</em></MenuItem>
                                            {warehouses.map((w: any) => (
                                                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Куда (Склад)</InputLabel>
                                        <Select name="toWarehouseId" value={formData.toWarehouseId} onChange={handleChange as any} label="Куда (Склад)">
                                            <MenuItem value=""><em>Нет (Списание / Продажа)</em></MenuItem>
                                            {warehouses.map((w: any) => (
                                                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField required label="Количество" name="quantity" type="number" value={formData.quantity} onChange={handleChange} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField required label="Цена" name="price" type="number" value={formData.price} onChange={handleChange} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Заметки" name="notes" value={formData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" />
                                </Grid>
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1, backgroundColor: "#F9F9F9", borderTop: "1px solid #EDEDED" }}>
                        <Button onClick={onClose} sx={{ color: "#757575", textTransform: "none" }}>Отмена</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending || !formData.productId}
                            sx={{
                                backgroundColor: "#CB673C",
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": { backgroundColor: "#A04E2B" }
                            }}
                        >
                            {createMutation.isPending ? "Сохранение..." : "Сохранить"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}