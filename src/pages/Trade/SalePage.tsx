
import { useState } from "react";
import * as React from "react";
import {
    Box, Container, Paper, Grid, Typography, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    type SelectChangeEvent, IconButton, Tooltip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Snackbar, Alert, CircularProgress, Chip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import Layout from "../../shared/ui/layout/Layout";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useCategories } from "../../entities/category/model/useCategories";
import {useTrade} from "../../entities/trades/model/useTrade";
import type {OrderStructureRequest} from "../../shared/types/tradeTypes";



interface SaleLineItem {
    id: number;               // local key
    productId: number | "";
    quantity: number | "";
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
            sx={{
                color: "#A04E2B",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                mb: 2,
                letterSpacing: "0.5px",
            }}
        >
            {children}
        </Typography>
    );
}

let lineCounter = 0;

export default function SalePage() {
    const { useGetAllCategories } = useCategories();
    const { data: categories = [] } = useGetAllCategories();

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehouses = [] } = useGetAllWarehouses();

    const [currentCatId, setCurrentCatId] = useState<number | "">("");
    const { useGetActiveProductsByCategory } = useGetProducts();
    const { data: products = [] } = useGetActiveProductsByCategory(
        currentCatId as number,
        currentCatId !== ""
    );

    const { useCreateSaleOrder } = useTrade();
    const saleOrderMutation = useCreateSaleOrder();

    const [documentNumber, setDocumentNumber] = useState("");
    const [warehouseId, setWarehouseId] = useState<number | "">("");
    const [lines, setLines] = useState<SaleLineItem[]>([
        { id: ++lineCounter, productId: "", quantity: "" },
    ]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const showNotification = (msg: string, severity: "success" | "error") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleAddLine = () => {
        setLines((prev) => [...prev, { id: ++lineCounter, productId: "", quantity: "" }]);
    };

    const handleRemoveLine = (id: number) => {
        setLines((prev) => prev.filter((l) => l.id !== id));
    };

    const handleLineProductChange = (id: number, value: number) => {
        setLines((prev) =>
            prev.map((l) => (l.id === id ? { ...l, productId: value } : l))
        );
    };

    const handleLineQuantityChange = (id: number, value: string) => {
        setLines((prev) =>
            prev.map((l) =>
                l.id === id ? { ...l, quantity: value === "" ? "" : parseFloat(value) } : l
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!documentNumber.trim()) {
            showNotification("Введите номер документа", "error");
            return;
        }
        if (warehouseId === "") {
            showNotification("Выберите склад отгрузки", "error");
            return;
        }
        const items: OrderStructureRequest[] = lines
            .filter((l) => l.productId !== "" && l.quantity !== "")
            .map((l) => ({
                productId: l.productId as number,
                quantity: l.quantity as number,
            }));

        if (items.length === 0) {
            showNotification("Добавьте хотя бы одну позицию", "error");
            return;
        }

        saleOrderMutation.mutate(
            { documentNumber, fromWarehouseId: warehouseId as number, items },
            {
                onSuccess: (data) => {
                    showNotification(
                        `Заказ №${data.documentNumber} успешно создан. Сумма: ${data.totalAmount?.toLocaleString("ru-RU")} ₽`,
                        "success"
                    );
                    setDocumentNumber("");
                    setWarehouseId("");
                    setLines([{ id: ++lineCounter, productId: "", quantity: "" }]);
                    setCurrentCatId("");
                },
                onError: () => {
                    showNotification("Ошибка при создании заказа на продажу", "error");
                },
            }
        );
    };

    return (
        <Layout titlePage="Продажа товаров">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                    <ShoppingCartCheckoutIcon sx={{ fontSize: 32, color: "#CB673C" }} />
                    <Box>
                        <Typography variant="h4" sx={{ color: "#422112", fontWeight: 700, lineHeight: 1 }}>
                            Оформление продажи
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
                            Создайте заказ на отгрузку товара со склада
                        </Typography>
                    </Box>
                    <Chip
                        label={`${lines.filter(l => l.productId !== "" && l.quantity !== "").length} поз.`}
                        sx={{ ml: "auto", backgroundColor: "#FFF5F0", color: "#CB673C", fontWeight: 700 }}
                    />
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* ── Реквизиты документа ── */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Реквизиты документа</SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Номер документа"
                                            value={documentNumber}
                                            onChange={(e) => setDocumentNumber(e.target.value)}
                                            fullWidth
                                            required
                                            size="small"
                                            placeholder="Например: ПРД-2024-001"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required size="small">
                                            <InputLabel>Склад отгрузки</InputLabel>
                                            <Select
                                                value={warehouseId}
                                                onChange={(e: SelectChangeEvent<number | "">) =>
                                                    setWarehouseId(e.target.value as number)
                                                }
                                                label="Склад отгрузки"
                                            >
                                                {warehouses.map((wh) => (
                                                    <MenuItem key={wh.id} value={wh.id}>
                                                        {wh.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* ── Товарные позиции ── */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <SectionTitle>Товарные позиции</SectionTitle>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                        {/* Фильтр по категории */}
                                        <FormControl size="small" sx={{ minWidth: 200 }}>
                                            <InputLabel>Категория товаров</InputLabel>
                                            <Select
                                                value={currentCatId}
                                                onChange={(e: SelectChangeEvent<number | "">) =>
                                                    setCurrentCatId(e.target.value as number)
                                                }
                                                label="Категория товаров"
                                            >
                                                <MenuItem value=""><em>Все категории</em></MenuItem>
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Tooltip title="Добавить строку" arrow>
                                            <IconButton
                                                onClick={handleAddLine}
                                                sx={{
                                                    color: "#CB673C",
                                                    "&:hover": { backgroundColor: "rgba(203,103,60,0.08)" },
                                                }}
                                            >
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ "& th": { fontWeight: 700, color: "#A04E2B", borderBottom: "2px solid #F5DBCF" } }}>
                                                <TableCell>№</TableCell>
                                                <TableCell>Товар</TableCell>
                                                <TableCell sx={{ width: 160 }}>Количество</TableCell>
                                                <TableCell sx={{ width: 60 }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lines.map((line, idx) => (
                                                <TableRow
                                                    key={line.id}
                                                    sx={{ "&:hover": { backgroundColor: "#FFF5F0" } }}
                                                >
                                                    <TableCell sx={{ color: "#9e9e9e", width: 40 }}>
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormControl fullWidth size="small">
                                                            <Select
                                                                value={line.productId}
                                                                onChange={(e: SelectChangeEvent<number | "">) =>
                                                                    handleLineProductChange(line.id, e.target.value as number)
                                                                }
                                                                displayEmpty
                                                                renderValue={(val) =>
                                                                    val === ""
                                                                        ? <span style={{ color: "#9e9e9e" }}>Выберите товар</span>
                                                                        : products.find((p) => p.id === val)?.name ?? String(val)
                                                                }
                                                            >
                                                                {products.length === 0 && (
                                                                    <MenuItem disabled>
                                                                        {currentCatId === "" ? "Сначала выберите категорию" : "Нет товаров в категории"}
                                                                    </MenuItem>
                                                                )}
                                                                {products.map((p) => (
                                                                    <MenuItem key={p.id} value={p.id}>
                                                                        <Box>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                                                                            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{p.sku}</Typography>
                                                                        </Box>
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineQuantityChange(line.id, e.target.value)}
                                                            inputProps={{ min: 0.001, step: 0.001 }}
                                                            placeholder="0"
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Удалить строку" arrow>
                                                            <IconButton
                                                                onClick={() => handleRemoveLine(line.id)}
                                                                size="small"
                                                                color="error"
                                                                disabled={lines.length === 1}
                                                                sx={{ "&:hover": { backgroundColor: "rgba(211,47,47,0.08)" } }}
                                                            >
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {lines.length > 0 && (
                                    <>
                                        <Divider sx={{ mt: 2, mb: 1.5 }} />
                                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                            <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                                Итого позиций:{" "}
                                                <strong style={{ color: "#422112" }}>
                                                    {lines.filter((l) => l.productId !== "" && l.quantity !== "").length}
                                                </strong>
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 2,
                                    p: 2,
                                    backgroundColor: "#F9F9F9",
                                    borderRadius: "8px",
                                    border: "1px solid #EDEDED",
                                }}
                            >
                                <Button
                                    onClick={() => {
                                        setDocumentNumber("");
                                        setWarehouseId("");
                                        setLines([{ id: ++lineCounter, productId: "", quantity: "" }]);
                                        setCurrentCatId("");
                                    }}
                                    sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}
                                >
                                    Очистить
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saleOrderMutation.isPending}
                                    startIcon={
                                        saleOrderMutation.isPending ? (
                                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                                        ) : (
                                            <ShoppingCartCheckoutIcon />
                                        )
                                    }
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
                                    {saleOrderMutation.isPending ? "Оформление..." : "Оформить продажу"}
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>
                </form>
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Layout>
    );
}