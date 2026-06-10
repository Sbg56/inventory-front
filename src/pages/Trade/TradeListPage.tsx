// TradeListPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Container, Paper, Typography, Button, ToggleButton, ToggleButtonGroup,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Collapse, CircularProgress, Chip, Tooltip
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import Layout from "../../shared/ui/layout/Layout";
import { useTrade } from "../../entities/trades/model/useTrade";
import type { OrderResponse, SupplierOrderResponse } from "../../shared/types/tradeTypes";
import { reportApi, openPdfBlob } from "../../entities/trades/model/reportApi";

type TradeMode = "sale" | "purchase";

// ─── Компонент раскрывающейся строки ─────────────────────────────────────────
function Row({ row, mode }: { row: OrderResponse | SupplierOrderResponse; mode: TradeMode }) {
    const [open, setOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const isSale = mode === "sale";

    const saleRow = row as OrderResponse;
    const purchaseRow = row as SupplierOrderResponse;

    const formattedDate = row.createdAt
        ? new Date(row.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—";

    const handlePrintPDF = async () => {
        setPdfLoading(true);
        try {
            if (isSale) {
                const request = {
                    documentNumber: saleRow.documentNumber,
                    orderDate: formattedDate,
                    customerName: saleRow.customerName ?? "",
                    status: "",
                    notes: saleRow.notes ?? "",
                    totalAmount: saleRow.totalAmount,
                    items: (saleRow.items ?? []).map((item: any) => ({
                        productName: item.productName ?? "",
                        sku: item.sku ?? "",
                        unit: item.unit ?? "шт.",
                        quantity: item.quantity,
                        price: item.price ?? 0,
                        totalPrice: item.totalPrice ?? 0,
                    })),
                };
                const blob = await reportApi.generateOrderPDF(request);
                openPdfBlob(blob, `Order_${saleRow.documentNumber}.pdf`);
            } else {
                const request = {
                    documentNumber: purchaseRow.documentNumber,
                    orderDate: formattedDate,
                    expectedDeliveryDate: "",
                    supplierName: purchaseRow.supplierName ?? "",
                    supplierContactPerson: "",
                    supplierPhone: "",
                    warehouseName: purchaseRow.warehouseName ?? "",
                    warehouseAddress: "",
                    status: purchaseRow.status ?? "",
                    notes: purchaseRow.notes ?? "",
                    totalAmount: purchaseRow.totalAmount,
                    items: (purchaseRow.items ?? []).map((item: any) => ({
                        productName: item.productName ?? "",
                        sku: item.sku ?? "",
                        unit: item.unit ?? "шт.",
                        quantity: item.quantity,
                        price: item.price ?? 0,
                        totalPrice: item.totalPrice ?? 0,
                    })),
                };
                const blob = await reportApi.generateSupplierOrderPDF(request);
                openPdfBlob(blob, `SupplierOrder_${purchaseRow.documentNumber}.pdf`);
            }
        } catch (e) {
            console.error("Ошибка генерации PDF", e);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <React.Fragment>
            <TableRow sx={{ "& > *": { borderBottom: "unset" }, "&:hover": { backgroundColor: "#FFF5F0" } }}>
                <TableCell sx={{ width: 50 }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)} sx={{ color: "#CB673C" }}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{formattedDate}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#422112" }}>{row.documentNumber}</TableCell>
                <TableCell>
                    {isSale
                        ? (saleRow.customerName || "—")
                        : (purchaseRow.supplierName || purchaseRow.warehouseName || "—")}
                </TableCell>
                <TableCell>
                    <Chip
                        label={`${row.totalAmount?.toLocaleString("ru-RU") ?? 0} ₽`}
                        size="small"
                        sx={{ backgroundColor: isSale ? "#E3F2FD" : "#E6F4EA", color: isSale ? "#1565C0" : "#137333", fontWeight: 700 }}
                    />
                </TableCell>
                <TableCell sx={{ color: "#757575", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.notes || "—"}
                </TableCell>
                <TableCell sx={{ width: 56 }}>
                    <Tooltip title="Скачать PDF" arrow>
                        <span>
                            <IconButton
                                size="small"
                                onClick={handlePrintPDF}
                                disabled={pdfLoading}
                                sx={{ color: "#CB673C", "&:hover": { backgroundColor: "rgba(203,103,60,0.08)" } }}
                            >
                                {pdfLoading
                                    ? <CircularProgress size={18} sx={{ color: "#CB673C" }} />
                                    : <PictureAsPdfIcon fontSize="small" />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, p: 2, bgcolor: "#FAFAFA", borderRadius: 2, border: "1px dashed #F5DBCF" }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: "#A04E2B", fontWeight: 700 }}>
                                Состав документа
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ "& th": { fontWeight: 600, color: "#757575" } }}>
                                        <TableCell>Товар</TableCell>
                                        <TableCell align="right">Кол-во</TableCell>
                                        <TableCell align="right">Цена</TableCell>
                                        <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items?.map((item: any) => (
                                        <TableRow key={item.id || item.productId}>
                                            <TableCell>{item.productName || `ID: ${item.productId}`}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">
                                                {item.price ? `${item.price.toLocaleString("ru-RU")} ₽` : "—"}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {item.totalPrice ? `${item.totalPrice.toLocaleString("ru-RU")} ₽` : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!row.items || row.items.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 2, color: "#9e9e9e" }}>
                                                Нет добавленных позиций
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

// ─── Главная страница ────────────────────────────────────────────────────────
export default function TradeListPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<TradeMode>("sale");

    const { useGetOrders, useGetSupplierOrders } = useTrade();

    const { data: sales = [], isLoading: isLoadingSales } = useGetOrders();
    const { data: purchases = [], isLoading: isLoadingPurchases } = useGetSupplierOrders();

    const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: TradeMode | null) => {
        if (newMode) setMode(newMode);
    };

    const isSale = mode === "sale";
    const currentData = isSale ? sales : purchases;
    const isLoading = isSale ? isLoadingSales : isLoadingPurchases;

    return (
        <Layout titlePage="Журнал торговых операций">
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {/* ── Шапка ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ color: "#422112", fontWeight: 700, lineHeight: 1 }}>
                            Журнал операций
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
                            Просмотр истории продаж и закупок
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={handleModeChange}
                            size="small"
                            sx={{
                                borderRadius: "8px", border: "1px solid #F5DBCF",
                                "& .MuiToggleButton-root": {
                                    textTransform: "none", fontWeight: 600, px: 2,
                                    "&.Mui-selected": { backgroundColor: "#CB673C", color: "#fff", "&:hover": { backgroundColor: "#A04E2B" } },
                                },
                            }}
                        >
                            <ToggleButton value="sale"><ShoppingCartCheckoutIcon fontSize="small" sx={{ mr: 1 }} /> Продажи</ToggleButton>
                            <ToggleButton value="purchase"><LocalShippingIcon fontSize="small" sx={{ mr: 1 }} /> Закупки</ToggleButton>
                        </ToggleButtonGroup>

                        {isSale ? (
                            <Button
                                variant="contained" startIcon={<AddIcon />}
                                onClick={() => navigate("/trade/sale/new")}
                                sx={{ bgcolor: "#CB673C", "&:hover": { bgcolor: "#A04E2B" }, textTransform: "none", fontWeight: 600, boxShadow: "none" }}
                            >
                                Создать продажу
                            </Button>
                        ) : (
                            <Button
                                variant="contained" startIcon={<AddIcon />}
                                onClick={() => navigate("/trade/purchase/new")}
                                sx={{ bgcolor: "#CB673C", "&:hover": { bgcolor: "#A04E2B" }, textTransform: "none", fontWeight: 600, boxShadow: "none" }}
                            >
                                Создать закупку
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* ── Таблица ── */}
                <Paper variant="outlined" sx={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #E0E0E0" }}>
                    <TableContainer>
                        <Table aria-label="collapsible table">
                            <TableHead sx={{ bgcolor: "#FAFAFA" }}>
                                <TableRow sx={{ "& th": { fontWeight: 700, color: "#757575", borderBottom: "2px solid #F5DBCF" } }}>
                                    <TableCell />
                                    <TableCell>Дата</TableCell>
                                    <TableCell>Документ</TableCell>
                                    <TableCell>{isSale ? "Контрагент (Покупатель)" : "Контрагент / Склад"}</TableCell>
                                    <TableCell>Сумма</TableCell>
                                    <TableCell>Примечание</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                            <CircularProgress sx={{ color: "#CB673C" }} />
                                        </TableCell>
                                    </TableRow>
                                ) : currentData.length > 0 ? (
                                    currentData.map((row) => (
                                        <Row key={row.id} row={row} mode={mode} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5, color: "#9e9e9e" }}>
                                            Список {isSale ? "продаж" : "закупок"} пуст
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

            </Container>
        </Layout>
    );
}
