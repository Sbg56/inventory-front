import { useState, useEffect } from "react";

import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, Paper } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";


import { useCategories } from "../../entities/category/model/useCategories";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import CreateStockMovementModal from "./CreateStockMovementModal";
import Loading from "../../shared/ui/base/Loading";
import {useStockMovements} from "../../entities/stockMovement/model/useStockMovements";
import {useStockMovementTableConfig} from "../../entities/stockMovement/ui/useStockMovementTableConfig";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";

export function StockMovementTable() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {useGetAllCategories} = useCategories();
    const {data: categories = []} = useGetAllCategories();

    const {useGetActiveProductsByCategory} = useGetProducts();
    const {data: products = [], isLoading: isProductsLoading} = useGetActiveProductsByCategory(
        Number(selectedCategoryId),
        !!selectedCategoryId
    );

    const {useGetMovementsByProduct} = useStockMovements();
    const {data: movements = [], isLoading: isMovementsLoading, isError, error} = useGetMovementsByProduct(selectedProductId);

    const {columns, defaultMRTOptions} = useStockMovementTableConfig();

    useEffect(() => {
        setSelectedProductId(null);
    }, [selectedCategoryId]);

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: movements,
        state: {
            isLoading: isMovementsLoading,
        },
        enableRowActions: false,
        renderTopToolbarCustomActions: () => (
            <Button
                variant="contained"
                startIcon={<CompareArrowsIcon/>}
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!selectedProductId}
                sx={{
                    backgroundColor: "#CB673C",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {backgroundColor: "#A04E2B"}
                }}
            >
                Новое движение
            </Button>
        ),
    });

    if (isMovementsLoading) {
        return <Loading content={"Загрузка движения товара..."} />;
    }

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <ErrorBlock content={"Ошибка при загрузке движений товаров!"} />
                <Typography color="error" sx={{ mt: 1 }}>
                    {error instanceof Error ? error.message : String(error)}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Paper sx={{
                p: 2,
                mb: 3,
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                backgroundColor: "#FAFAFA"
            }}>
                {/* Селект Категории */}
                <FormControl size="small" sx={{minWidth: 250}}>
                    <InputLabel>Категория</InputLabel>
                    <Select
                        value={selectedCategoryId}
                        label="Категория"
                        onChange={(e) => setSelectedCategoryId(e.target.value as number)}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Селект Товара (зависит от категории) */}
                <FormControl size="small" sx={{minWidth: 300}} disabled={!selectedCategoryId || isProductsLoading}>
                    <InputLabel>{isProductsLoading ? "Загрузка товаров..." : "Товар"}</InputLabel>
                    <Select
                        value={selectedProductId || ""}
                        label={isProductsLoading ? "Загрузка товаров..." : "Товар"}
                        onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    >
                        {products.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {selectedProductId ? (
                <MaterialReactTable table={table}/>
            ) : (
                <Box sx={{p: 6, textAlign: "center", border: "1px dashed #CCC", borderRadius: 2, bgcolor: "#FFF"}}>
                    <Typography color="textSecondary">
                        {!selectedCategoryId
                            ? "Пожалуйста, сначала выберите категорию, а затем товар для просмотра движений."
                            : "Теперь выберите конкретный товар из списка."}
                    </Typography>
                </Box>
            )}

            <CreateStockMovementModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                preselectedCategoryId={selectedCategoryId ? Number(selectedCategoryId) : null}
                preselectedProductId={selectedProductId}
            />
        </Box>
    );
}