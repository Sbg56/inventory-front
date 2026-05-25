
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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Layout from "../../shared/ui/layout/Layout";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import { useCategories } from "../../entities/category/model/useCategories";

import type { SupplierOrderStructureRequest } from "../../shared/types/tradeTypes";
import {useTrade} from "../../entities/trades/model/useTrade";

interface PurchaseLineItem {
    id: number;
    productId: number | "";
    quantity: number | "";
    price: number | "";
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

export default function PurchasePage() {
    const { useGetAllCategories } = useCategories();
    const { data: categories = [] } = useGetAllCategories();

    const { useGetAllWarehouses } = useWarehouses();
    const { data: warehouses = [] } = useGetAllWarehouses();

    const { useGetActiveSuppliers } = useSuppliers();
    const { data: suppliers = [] } = useGetActiveSuppliers();

    const [currentCatId, setCurrentCatId] = useState<number | "">("");
    const { useGetActiveProductsByCategory } = useGetProducts();
    const { data: products = [] } = useGetActiveProductsByCategory(
        currentCatId as number,
        currentCatId !== ""
    );

    const { useCreatePurchaseOrder } = useTrade();
    const purchaseOrderMutation = useCreatePurchaseOrder();

    const [documentNumber, setDocumentNumber] = useState("");
    const [warehouseId, setWarehouseId] = useState<number | "">("");
    const [supplierId, setSupplierId] = useState<number | "">("");
    const [lines, setLines] = useState<PurchaseLineItem[]>([
        { id: ++lineCounter, productId: "", quantity: "", price: "" },
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
        setLines((prev) => [
            ...prev,
            { id: ++lineCounter, productId: "", quantity: "", price: "" },
        ]);
    };

    const handleRemoveLine = (id: number) => {
        setLines((prev) => prev.filter((l) => l.id !== id));
    };

    const handleLineChange = (
        id: number,
        field: "productId" | "quantity" | "price",
        value: string | number
    ) => {
        setLines((prev) =>
            prev.map((l) => {
                if (l.id !== id) return l;
                if (field === "productId") return { ...l, productId: value as number };
                const num = value === "" ? "" : parseFloat(value as string);
                return { ...l, [field]: num };
            })
        );
    };

    const totalAmount = lines.reduce((acc, l) => {
        if (l.quantity !== "" && l.price !== "") {
            return acc + (l.quantity as number) * (l.price as number);
        }
        return acc;
    }, 0);

    const handleReset = () => {
        setDocumentNumber("");
        setWarehouseId("");
        setSupplierId("");
        setLines([{ id: ++lineCounter, productId: "", quantity: "", price: "" }]);
        setCurrentCatId("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!documentNumber.trim()) {
            showNotification("Введите номер документа", "error");
            return;
        }
        if (warehouseId === "") {
            showNotification("Выберите склад приемки", "error");
            return;
        }

        const items: SupplierOrderStructureRequest[] = lines
            .filter((l) => l.productId !== "" && l.quantity !== "" && l.price !== "")
            .map((l) => ({
                productId: l.productId as number,
                quantity: l.quantity as number,
                price: l.price as number,
            }));

        if (items.length === 0) {
            showNotification("Добавьте хотя бы одну позицию с ценой и количеством", "error");
            return;
        }

        purchaseOrderMutation.mutate(
            {
                documentNumber,
                warehouseId: warehouseId as number,
                supplierId: supplierId !== "" ? (supplierId as number) : undefined,
                items,
            },
            {
                onSuccess: (data) => {
                    showNotification(
                        `Закупка №${data.documentNumber} успешно проведена. Сумма: ${data.totalAmount?.toLocaleString("ru-RU")} ₽`,
                        "success"
                    );
                    handleReset();
                },
                onError: () => {
                    showNotification("Ошибка при создании заказа на закупку", "error");
                },
            }
        );
    };

    const filledLines = lines.filter(
        (l) => l.productId !== "" && l.quantity !== "" && l.price !== ""
    ).length;

    return (
        <Layout titlePage="Закупка товаров">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                    <LocalShippingIcon sx={{ fontSize: 32, color: "#CB673C" }} />
                    <Box>
                        <Typography variant="h4" sx={{ color: "#422112", fontWeight: 700, lineHeight: 1 }}>
                            Оформление закупки
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
                            Создайте приходный документ от поставщика
                        </Typography>
                    </Box>
                    {totalAmount > 0 && (
                        <Chip
                            label={`${totalAmount.toLocaleString("ru-RU")} ₽`}
                            sx={{ ml: "auto", backgroundColor: "#E6F4EA", color: "#137333", fontWeight: 700, fontSize: "0.95rem" }}
                        />
                    )}
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* ── Реквизиты документа ── */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionTitle>Реквизиты документа</SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Номер документа"
                                            value={documentNumber}
                                            onChange={(e) => setDocumentNumber(e.target.value)}
                                            fullWidth
                                            required
                                            size="small"
                                            placeholder="Например: ЗАК-2024-001"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth required size="small">
                                            <InputLabel>Склад приемки</InputLabel>
                                            <Select
                                                value={warehouseId}
                                                onChange={(e: SelectChangeEvent<number | "">) =>
                                                    setWarehouseId(e.target.value as number)
                                                }
                                                label="Склад приемки"
                                            >
                                                {warehouses.map((wh) => (
                                                    <MenuItem key={wh.id} value={wh.id}>
                                                        {wh.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Поставщик</InputLabel>
                                            <Select
                                                value={supplierId}
                                                onChange={(e: SelectChangeEvent<number | "">) =>
                                                    setSupplierId(e.target.value as number)
                                                }
                                                label="Поставщик"
                                            >
                                                <MenuItem value=""><em>Не указан</em></MenuItem>
                                                {suppliers.map((sup) => (
                                                    <MenuItem key={sup.id} value={sup.id}>
                                                        {sup.name}
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
                                            <TableRow
                                                sx={{
                                                    "& th": {
                                                        fontWeight: 700,
                                                        color: "#A04E2B",
                                                        borderBottom: "2px solid #F5DBCF",
                                                    },
                                                }}
                                            >
                                                <TableCell sx={{ width: 40 }}>№</TableCell>
                                                <TableCell>Товар</TableCell>
                                                <TableCell sx={{ width: 160 }}>Количество</TableCell>
                                                <TableCell sx={{ width: 180 }}>Цена закупки (₽)</TableCell>
                                                <TableCell sx={{ width: 130 }}>Сумма</TableCell>
                                                <TableCell sx={{ width: 60 }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lines.map((line, idx) => {
                                                const lineTotal =
                                                    line.quantity !== "" && line.price !== ""
                                                        ? (line.quantity as number) * (line.price as number)
                                                        : null;

                                                return (
                                                    <TableRow
                                                        key={line.id}
                                                        sx={{ "&:hover": { backgroundColor: "#FFF5F0" } }}
                                                    >
                                                        <TableCell sx={{ color: "#9e9e9e" }}>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={line.productId}
                                                                    onChange={(e: SelectChangeEvent<number | "">) =>
                                                                        handleLineChange(line.id, "productId", e.target.value as number)
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
                                                                            {currentCatId === ""
                                                                                ? "Сначала выберите категорию"
                                                                                : "Нет товаров в категории"}
                                                                        </MenuItem>
                                                                    )}
                                                                    {products.map((p) => (
                                                                        <MenuItem key={p.id} value={p.id}>
                                                                            <Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                    {p.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                                                                                    {p.sku}
                                                                                </Typography>
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
                                                                onChange={(e) =>
                                                                    handleLineChange(line.id, "quantity", e.target.value)
                                                                }
                                                                inputProps={{ min: 0.001, step: 0.001 }}
                                                                placeholder="0"
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={line.price}
                                                                onChange={(e) =>
                                                                    handleLineChange(line.id, "price", e.target.value)
                                                                }
                                                                inputProps={{ min: 0, step: 0.01 }}
                                                                placeholder="0.00"
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ fontWeight: 600, color: lineTotal ? "#137333" : "#bdbdbd" }}
                                                            >
                                                                {lineTotal !== null
                                                                    ? `${lineTotal.toLocaleString("ru-RU")} ₽`
                                                                    : "—"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title="Удалить строку" arrow>
                                                                <IconButton
                                                                    onClick={() => handleRemoveLine(line.id)}
                                                                    size="small"
                                                                    color="error"
                                                                    disabled={lines.length === 1}
                                                                    sx={{
                                                                        "&:hover": {
                                                                            backgroundColor: "rgba(211,47,47,0.08)",
                                                                        },
                                                                    }}
                                                                >
                                                                    <DeleteOutlineIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Divider sx={{ mt: 2, mb: 1.5 }} />
                                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                                    <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                        Позиций:{" "}
                                        <strong style={{ color: "#422112" }}>{filledLines}</strong>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: "#422112" }}>
                                        Итого:{" "}
                                        <span style={{ color: "#CB673C" }}>
                                            {totalAmount.toLocaleString("ru-RU")} ₽
                                        </span>
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* ── Примечание о ценообразовании ── */}
                        <Grid item xs={12}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderLeft: "5px solid #4CAF50",
                                    borderRadius: "4px 8px 8px 4px",
                                    bgcolor: "#F6FFF7",
                                }}
                            >
                                <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                                    💡 <strong>Автоматическое ценообразование:</strong> при проведении закупки цена продажи будет
                                    автоматически рассчитана с наценкой 20% от закупочной цены. Предыдущая цена будет деактивирована.
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* ── Кнопки ── */}
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
                                    onClick={handleReset}
                                    sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}
                                >
                                    Очистить
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={purchaseOrderMutation.isPending}
                                    startIcon={
                                        purchaseOrderMutation.isPending ? (
                                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                                        ) : (
                                            <LocalShippingIcon />
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
                                    {purchaseOrderMutation.isPending ? "Проведение..." : "Провести закупку"}
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