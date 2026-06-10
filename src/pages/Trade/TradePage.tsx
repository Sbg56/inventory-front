
import { useState } from "react";
import * as React from "react";
import {
    Box, Container, Paper, Grid, Typography, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    type SelectChangeEvent, IconButton, Tooltip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Snackbar, Alert, CircularProgress, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Layout from "../../shared/ui/layout/Layout";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { useWarehouses } from "../../entities/warehouseApi/model/useWarehouses";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import { useCategories } from "../../entities/category/model/useCategories";

import type { OrderStructureRequest, SupplierOrderStructureRequest } from "../../shared/types/tradeTypes";
import {useTrade} from "../../entities/trades/model/useTrade";

// ─── Types ───────────────────────────────────────────────────────────────────

type TradeMode = "sale" | "purchase";

interface SaleLineItem {
    id: number;
    productId: number | "";
    quantity: number | "";
}

interface PurchaseLineItem {
    id: number;
    productId: number | "";
    quantity: number | "";
    price: number | "";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sectionPaper = {
    p: 2.5,
    borderLeft: "5px solid #CB673C",
    borderRadius: "4px 8px 8px 4px",
    bgcolor: "#FAFAFA",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{
            color: "#A04E2B", fontWeight: 700, fontSize: "0.9rem",
            textTransform: "uppercase", mb: 2, letterSpacing: "0.5px",
        }}>
            {children}
        </Typography>
    );
}

let lineCounter = 0;
const newSaleLine = (): SaleLineItem => ({ id: ++lineCounter, productId: "", quantity: "" });
const newPurchaseLine = (): PurchaseLineItem => ({ id: ++lineCounter, productId: "", quantity: "", price: "" });

// ─── Component ───────────────────────────────────────────────────────────────

export default function TradePage() {
    const [mode, setMode] = useState<TradeMode>("sale");

    // shared data hooks
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

    // mutations
    const { useCreateSaleOrder, useCreatePurchaseOrder } = useTrade();
    const saleOrderMutation = useCreateSaleOrder();
    const purchaseOrderMutation = useCreatePurchaseOrder();

    // sale form state
    const [saleDocNumber, setSaleDocNumber] = useState("");
    const [saleCustomerName, setSaleCustomerName] = useState("");
    const [saleNotes, setSaleNotes] = useState("");
    const [saleWarehouseId, setSaleWarehouseId] = useState<number | "">("");
    const [saleLines, setSaleLines] = useState<SaleLineItem[]>([newSaleLine()]);

    // purchase form state
    const [purchaseDocNumber, setPurchaseDocNumber] = useState("");
    const [purchaseWarehouseId, setPurchaseWarehouseId] = useState<number | "">("");
    const [purchaseSupplierId, setPurchaseSupplierId] = useState<number | "">("");
    const [purchaseLines, setPurchaseLines] = useState<PurchaseLineItem[]>([newPurchaseLine()]);
    const [purchaseNotes, setPurchaseNotes] = useState("");

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const showNotification = (msg: string, severity: "success" | "error") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: TradeMode | null) => {
        if (newMode) {
            setMode(newMode);
            setCurrentCatId("");
        }
    };

    // ── Sale handlers ──────────────────────────────────────────────────────

    const handleSaleReset = () => {
        setSaleDocNumber("");
        setSaleWarehouseId("");
        setSaleCustomerName("");
        setSaleNotes("");
        setSaleLines([newSaleLine()]);
        setCurrentCatId("");
    };

    const handleSaleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!saleDocNumber.trim()) { showNotification("Введите номер документа", "error"); return; }
        if (saleWarehouseId === "") { showNotification("Выберите склад отгрузки", "error"); return; }
        const items: OrderStructureRequest[] = saleLines
            .filter(l => l.productId !== "" && l.quantity !== "")
            .map(l => ({ productId: l.productId as number, quantity: l.quantity as number }));
        if (items.length === 0) { showNotification("Добавьте хотя бы одну позицию", "error"); return; }

        saleOrderMutation.mutate(
            {
                documentNumber: saleDocNumber,
                customerName: saleCustomerName.trim() || undefined,
                notes: saleNotes.trim() || undefined,
                fromWarehouseId: saleWarehouseId as number,
                items },
            {
                onSuccess: (data) => {
                    showNotification(`Заказ №${data.documentNumber} оформлен. Сумма: ${data.totalAmount?.toLocaleString("ru-RU")} ₽`, "success");
                    handleSaleReset();
                },
                onError: () => showNotification("Ошибка при создании заказа на продажу", "error"),
            }
        );
    };

    // ── Purchase handlers ──────────────────────────────────────────────────

    const purchaseTotal = purchaseLines.reduce((acc, l) =>
        l.quantity !== "" && l.price !== "" ? acc + (l.quantity as number) * (l.price as number) : acc, 0
    );

    const handlePurchaseReset = () => {
        setPurchaseDocNumber("");
        setPurchaseWarehouseId("");
        setPurchaseNotes("");
        setPurchaseSupplierId("");
        setPurchaseLines([newPurchaseLine()]);
        setCurrentCatId("");
    };

    const handlePurchaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseDocNumber.trim()) { showNotification("Введите номер документа", "error"); return; }
        if (purchaseWarehouseId === "") { showNotification("Выберите склад приемки", "error"); return; }
        const items: SupplierOrderStructureRequest[] = purchaseLines
            .filter(l => l.productId !== "" && l.quantity !== "" && l.price !== "")
            .map(l => ({ productId: l.productId as number, quantity: l.quantity as number, price: l.price as number }));
        if (items.length === 0) { showNotification("Добавьте хотя бы одну позицию с ценой и количеством", "error"); return; }

        purchaseOrderMutation.mutate(
            {
                documentNumber: purchaseDocNumber,
                warehouseId: purchaseWarehouseId as number,
                notes: purchaseNotes.trim() || undefined,
                supplierId: purchaseSupplierId !== "" ? purchaseSupplierId as number : undefined,
                items,
            },
            {
                onSuccess: (data) => {
                    showNotification(`Закупка №${data.documentNumber} проведена. Сумма: ${data.totalAmount?.toLocaleString("ru-RU")} ₽`, "success");
                    handlePurchaseReset();
                },
                onError: () => showNotification("Ошибка при проведении закупки", "error"),
            }
        );
    };

    // ── Shared product filter toolbar ──────────────────────────────────────

    const CategoryFilterAndAddRow = ({ onAdd }: { onAdd: () => void }) => (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Категория товаров</InputLabel>
                <Select
                    value={currentCatId}
                    onChange={(e: SelectChangeEvent<number | "">) => setCurrentCatId(e.target.value as number)}
                    label="Категория товаров"
                >
                    <MenuItem value=""><em>Все категории</em></MenuItem>
                    {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Tooltip title="Добавить строку" arrow>
                <IconButton onClick={onAdd} sx={{ color: "#CB673C", "&:hover": { backgroundColor: "rgba(203,103,60,0.08)" } }}>
                    <AddCircleOutlineIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const ProductSelect = ({ value, onChange }: { value: number | ""; onChange: (v: number) => void }) => (
        <FormControl fullWidth size="small">
            <Select
                value={value}
                onChange={(e: SelectChangeEvent<number | "">) => onChange(e.target.value as number)}
                displayEmpty
                renderValue={val =>
                    val === ""
                        ? <span style={{ color: "#9e9e9e" }}>Выберите товар</span>
                        : products.find(p => p.id === val)?.name ?? String(val)
                }
            >
                {products.length === 0 && (
                    <MenuItem disabled>
                        {currentCatId === "" ? "Сначала выберите категорию" : "Нет товаров в категории"}
                    </MenuItem>
                )}
                {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{p.sku}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    const isSale = mode === "sale";
// ─────────────────────────────────────────────────────────────────────────

    return (
        <Layout titlePage="Торговые операции">
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {/* ── Mode switcher ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {isSale
                            ? <ShoppingCartCheckoutIcon sx={{ fontSize: 32, color: "#CB673C" }} />
                            : <LocalShippingIcon sx={{ fontSize: 32, color: "#CB673C" }} />
                        }
                        <Box>
                            <Typography variant="h4" sx={{ color: "#422112", fontWeight: 700, lineHeight: 1 }}>
                                {isSale ? "Оформление продажи" : "Оформление закупки"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
                                {isSale
                                    ? "Создайте заказ на отгрузку товара со склада"
                                    : "Создайте приходный документ от поставщика"
                                }
                            </Typography>
                        </Box>
                    </Box>

                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleModeChange}
                        sx={{
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #F5DBCF",
                            "& .MuiToggleButton-root": {
                                border: "none",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                px: 3,
                                py: 1,
                                color: "#9e9e9e",
                                transition: "all 0.2s",
                                "&.Mui-selected": {
                                    backgroundColor: "#CB673C",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#A04E2B" },
                                },
                                "&:hover": { backgroundColor: "#FFF5F0", color: "#CB673C" },
                            },
                        }}
                    >
                        <ToggleButton value="sale" sx={{ gap: 1 }}>
                            <ShoppingCartCheckoutIcon fontSize="small" />
                            Продажа
                        </ToggleButton>
                        <ToggleButton value="purchase" sx={{ gap: 1 }}>
                            <LocalShippingIcon fontSize="small" />
                            Закупка
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* ══════════════════════════ SALE FORM ══════════════════════════ */}
                {isSale && (
                    <form onSubmit={handleSaleSubmit}>
                        <Grid container spacing={3}>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <SectionTitle>Обязательные реквизиты</SectionTitle>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Номер документа" value={saleDocNumber}
                                                onChange={e => setSaleDocNumber(e.target.value)}
                                                fullWidth required size="small" placeholder="Например: ПРД-2024-001"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth required size="small" sx={{ minWidth: 200, width: '100%' }}>
                                                <InputLabel>Склад отгрузки</InputLabel>
                                                <Select
                                                    value={saleWarehouseId}
                                                    onChange={(e: SelectChangeEvent<number | "">) => setSaleWarehouseId(e.target.value as number)}
                                                    label="Склад отгрузки"
                                                >
                                                    {warehouses.map(wh => <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <SectionTitle>Реквизиты документа</SectionTitle>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Покупатель"
                                                value={saleCustomerName}
                                                onChange={e => setSaleCustomerName(e.target.value)}
                                                fullWidth size="small"
                                                placeholder="Например: ООО Ромашка"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                label="Примечание"
                                                value={saleNotes}
                                                onChange={e => setSaleNotes(e.target.value)}
                                                fullWidth size="small"
                                                multiline rows={2}
                                                placeholder="Необязательное примечание к заказу"
                                            />
                                        </Grid>
                                    </Grid>

                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <SectionTitle>Товарные позиции</SectionTitle>
                                        <CategoryFilterAndAddRow onAdd={() => setSaleLines(prev => [...prev, newSaleLine()])} />
                                    </Box>

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ "& th": { fontWeight: 700, color: "#A04E2B", borderBottom: "2px solid #F5DBCF" } }}>
                                                    <TableCell sx={{ width: 40 }}>№</TableCell>
                                                    <TableCell>Товар</TableCell>
                                                    <TableCell sx={{ width: 160 }}>Количество</TableCell>
                                                    <TableCell sx={{ width: 60 }}></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {saleLines.map((line, idx) => (
                                                    <TableRow key={line.id} sx={{ "&:hover": { backgroundColor: "#FFF5F0" } }}>
                                                        <TableCell sx={{ color: "#9e9e9e" }}>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <ProductSelect
                                                                value={line.productId}
                                                                onChange={v => setSaleLines(prev => prev.map(l => l.id === line.id ? { ...l, productId: v } : l))}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                type="number" size="small" value={line.quantity} fullWidth
                                                                onChange={e => setSaleLines(prev => prev.map(l => l.id === line.id ? { ...l, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) } : l))}
                                                                inputProps={{ min: 0.001, step: 0.001 }} placeholder="0"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title="Удалить строку" arrow>
                                                                <IconButton
                                                                    onClick={() => setSaleLines(prev => prev.filter(l => l.id !== line.id))}
                                                                    size="small" color="error" disabled={saleLines.length === 1}
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

                                    <Divider sx={{ mt: 2, mb: 1.5 }} />
                                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                        <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                            Итого позиций:{" "}
                                            <strong style={{ color: "#422112" }}>
                                                {saleLines.filter(l => l.productId !== "" && l.quantity !== "").length}
                                            </strong>
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <SubmitBar
                                    onReset={handleSaleReset}
                                    isPending={saleOrderMutation.isPending}
                                    icon={<ShoppingCartCheckoutIcon />}
                                    label="Оформить продажу"
                                    pendingLabel="Оформление..."
                                />
                            </Grid>
                        </Grid>
                    </form>
                )}

                {/* ══════════════════════════ PURCHASE FORM ══════════════════════════ */}
                {!isSale && (
                    <form onSubmit={handlePurchaseSubmit}>
                        <Grid container spacing={3}>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <SectionTitle>Реквизиты документа</SectionTitle>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Номер документа" value={purchaseDocNumber}
                                                onChange={e => setPurchaseDocNumber(e.target.value)}
                                                fullWidth required size="small" placeholder="Например: ЗАК-2024-001"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth required size="small" sx={{ minWidth: 200, width: '100%' }}>
                                                <InputLabel>Склад приемки</InputLabel>
                                                <Select
                                                    value={purchaseWarehouseId}
                                                    onChange={(e: SelectChangeEvent<number | "">) => setPurchaseWarehouseId(e.target.value as number)}
                                                    label="Склад приемки"
                                                >
                                                    {warehouses.map(wh => <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small" sx={{ minWidth: 200, width: '100%' }}>
                                                <InputLabel>Поставщик</InputLabel>
                                                <Select
                                                    value={purchaseSupplierId}
                                                    onChange={(e: SelectChangeEvent<number | "">) => setPurchaseSupplierId(e.target.value as number)}
                                                    label="Поставщик"
                                                >
                                                    <MenuItem value=""><em>Не указан</em></MenuItem>
                                                    {suppliers.map(sup => <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <SectionTitle>Реквизиты документа</SectionTitle>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Примечание"
                                                value={purchaseNotes}
                                                onChange={e => setPurchaseNotes(e.target.value)}
                                                fullWidth size="small"
                                                multiline rows={2}
                                                placeholder="Необязательное примечание к закупке"
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={sectionPaper}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <SectionTitle>Товарные позиции</SectionTitle>
                                        <CategoryFilterAndAddRow onAdd={() => setPurchaseLines(prev => [...prev, newPurchaseLine()])} />
                                    </Box>

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ "& th": { fontWeight: 700, color: "#A04E2B", borderBottom: "2px solid #F5DBCF" } }}>
                                                    <TableCell sx={{ width: 40 }}>№</TableCell>
                                                    <TableCell>Товар</TableCell>
                                                    <TableCell sx={{ width: 160 }}>Количество</TableCell>
                                                    <TableCell sx={{ width: 180 }}>Цена закупки (₽)</TableCell>
                                                    <TableCell sx={{ width: 130 }}>Сумма</TableCell>
                                                    <TableCell sx={{ width: 60 }}></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {purchaseLines.map((line, idx) => {
                                                    const lineTotal = line.quantity !== "" && line.price !== ""
                                                        ? (line.quantity as number) * (line.price as number) : null;
                                                    return (
                                                        <TableRow key={line.id} sx={{ "&:hover": { backgroundColor: "#FFF5F0" } }}>
                                                            <TableCell sx={{ color: "#9e9e9e" }}>{idx + 1}</TableCell>
                                                            <TableCell>
                                                                <ProductSelect
                                                                    value={line.productId}
                                                                    onChange={v => setPurchaseLines(prev => prev.map(l => l.id === line.id ? { ...l, productId: v } : l))}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number" size="small" value={line.quantity} fullWidth
                                                                    onChange={e => setPurchaseLines(prev => prev.map(l => l.id === line.id ? { ...l, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) } : l))}
                                                                    inputProps={{ min: 0.001, step: 0.001 }} placeholder="0"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number" size="small" value={line.price} fullWidth
                                                                    onChange={e => setPurchaseLines(prev => prev.map(l => l.id === line.id ? { ...l, price: e.target.value === "" ? "" : parseFloat(e.target.value) } : l))}
                                                                    inputProps={{ min: 0, step: 0.01 }} placeholder="0.00"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: lineTotal ? "#137333" : "#bdbdbd" }}>
                                                                    {lineTotal !== null ? `${lineTotal.toLocaleString("ru-RU")} ₽` : "—"}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="Удалить строку" arrow>
                                                                    <IconButton
                                                                        onClick={() => setPurchaseLines(prev => prev.filter(l => l.id !== line.id))}
                                                                        size="small" color="error" disabled={purchaseLines.length === 1}
                                                                        sx={{ "&:hover": { backgroundColor: "rgba(211,47,47,0.08)" } }}
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
                                            <strong style={{ color: "#422112" }}>
                                                {purchaseLines.filter(l => l.productId !== "" && l.quantity !== "" && l.price !== "").length}
                                            </strong>
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: "#422112" }}>
                                            Итого:{" "}
                                            <span style={{ color: "#CB673C" }}>{purchaseTotal.toLocaleString("ru-RU")} ₽</span>
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, borderLeft: "5px solid #4CAF50", borderRadius: "4px 8px 8px 4px", bgcolor: "#F6FFF7" }}>
                                    <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                                        💡 <strong>Автоматическое ценообразование:</strong> при проведении закупки цена продажи будет
                                        автоматически рассчитана с наценкой 20% от закупочной цены. Предыдущая цена будет деактивирована.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <SubmitBar
                                    onReset={handlePurchaseReset}
                                    isPending={purchaseOrderMutation.isPending}
                                    icon={<LocalShippingIcon />}
                                    label="Провести закупку"
                                    pendingLabel="Проведение..."
                                />
                            </Grid>
                        </Grid>
                    </form>
                )}

            </Container>

            <Snackbar
                open={snackbarOpen} autoHideDuration={5000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Layout>
    );
}

// ─── Submit bar ───────────────────────────────────────────────────────────────

function SubmitBar({ onReset, isPending, icon, label, pendingLabel }: {
    onReset: () => void;
    isPending: boolean;
    icon: React.ReactNode;
    label: string;
    pendingLabel: string;
}) {
    return (
        <Box sx={{
            display: "flex", justifyContent: "flex-end", gap: 2, p: 2,
            backgroundColor: "#F9F9F9", borderRadius: "8px", border: "1px solid #EDEDED",
        }}>
            <Button onClick={onReset} sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}>
                Очистить
            </Button>
            <Button
                type="submit" variant="contained" disabled={isPending}
                startIcon={isPending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : icon}
                sx={{
                    backgroundColor: "#CB673C", textTransform: "none", fontWeight: 600,
                    px: 4, borderRadius: "6px", boxShadow: "none",
                    "&:hover": { backgroundColor: "#A04E2B", boxShadow: "none" },
                }}
            >
                {isPending ? pendingLabel : label}
            </Button>
        </Box>
    );
}