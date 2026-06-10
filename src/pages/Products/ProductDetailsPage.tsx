
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Container, Paper, Grid, Typography,
    Button, Divider, CircularProgress, Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import Layout from "../../shared/ui/layout/Layout";
import EditProductModal from "./EditProductModal";

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [editOpen, setEditOpen] = useState(false);

    const { useGetProductsById } = useGetProducts();
    const { data: product, isLoading, error } = useGetProductsById(Number(id));

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <CircularProgress sx={{ color: "#CB673C" }} />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography color="error" variant="h5">Ошибка загрузки данных о товаре</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Назад к списку
                </Button>
            </Container>
        );
    }

    return (
        <Layout titlePage={"Информация о товаре"}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Хедер страницы */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                    <Box>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{ color: "#757575", textTransform: "none", mb: 1, "&:hover": { color: "#CB673C" } }}
                        >
                            Назад к списку товаров
                        </Button>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="h4" sx={{ color: "#422112", fontWeight: 700 }}>
                                {product.name}
                            </Typography>
                            <Chip
                                label={product.isActive ? "Активен" : "Неактивен"}
                                sx={{
                                    backgroundColor: product.isActive ? "#E6F4EA" : "#FCE8E6",
                                    color: product.isActive ? "#137333" : "#C5221F",
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditOpen(true)}
                        sx={{
                            color: "#CB673C",
                            borderColor: "#CB673C",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { borderColor: "#A04E2B", backgroundColor: "#FFF5F0" },
                        }}
                    >
                        Редактировать
                    </Button>
                </Box>

                <Grid container spacing={6}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={7}>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 3, borderLeft: "5px solid #CB673C", borderRadius: "4px 8px 8px 4px", backgroundColor: "#FAFAFA" }}>
                                    <Typography sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", mb: 2, letterSpacing: "0.5px" }}>
                                        Идентификация и классификация
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="caption" color="textSecondary">Артикул (SKU)</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: "#2C140A" }}>{product.sku}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="caption" color="textSecondary">Штрих-код</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.barcode || "—"}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="caption" color="textSecondary">Категория</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.categoryName || "—"}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>


                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 3, borderLeft: "5px solid #CB673C", borderRadius: "4px 8px 8px 4px", backgroundColor: "#FAFAFA" }}>
                                    <Typography sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", mb: 2, letterSpacing: "0.5px" }}>
                                        Размещение и снабжение
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="caption" color="textSecondary">Основной поставщик</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.supplierName || "—"}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="caption" color="textSecondary">Склад хранения</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.warehouseName || "Не указан"}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>


                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 3, borderLeft: "5px solid #CB673C", borderRadius: "4px 8px 8px 4px", backgroundColor: "#FAFAFA" }}>
                                    <Typography sx={{ color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", mb: 2, letterSpacing: "0.5px" }}>
                                        Описание товара
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: "#4A4A4A" }}>
                                        {product.description || "Описание отсутствует."}
                                    </Typography>
                                    {product.notes && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="caption" color="textSecondary">Дополнительные заметки</Typography>
                                            <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic" }}>
                                                {product.notes}
                                            </Typography>
                                        </>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>


                    <Grid item xs={12} md={4}>
                        <Grid container spacing={3}>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 3, backgroundColor: "#FAFAFA", borderRadius: "8px" }}>
                                    <Typography sx={{ color: "#422112", fontWeight: 700, fontSize: "1rem", mb: 2 }}>
                                        Характеристики единицы
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography variant="body2" color="textSecondary">Базовая ед. изм.:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.unit}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography variant="body2" color="textSecondary">Вес:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.weight ? `${product.weight} кг` : "—"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2" color="textSecondary">Объем:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.volume ? `${product.volume} м³` : "—"}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>


                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 3, backgroundColor: "#FFFDFB", borderColor: "#F5DBCF", borderRadius: "8px" }}>
                                    <Typography sx={{ color: "#CB673C", fontWeight: 700, fontSize: "1rem", mb: 2 }}>
                                        Лимиты запасов
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography variant="body2" color="textSecondary">Минимальный порог:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#C5221F" }}>
                                            {product.minStock !== null && product.minStock !== undefined ? `${product.minStock} ${product.unit}` : "Не задан"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2" color="textSecondary">Максимальный лимит:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#137333" }}>
                                            {product.maxStock !== null && product.maxStock !== undefined ? `${product.maxStock} ${product.unit}` : "Не задан"}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>

            {/* Модалка редактирования */}
            <EditProductModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                product={product}
            />
        </Layout>
    );
}
