import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import {
    Box,
    Typography,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import Layout from "../../shared/ui/layout/Layout";
import { usePermissions } from "../../shared/auth/usePermissions";
import { useTrade } from "../../entities/trades/model/useTrade";
import { useTradeTableConfig } from "../../entities/trades/ui/useTradeTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import type {
    OrderResponse,
    OrderStructureResponse,
    SupplierOrderResponse,
    SupplierOrderStructureResponse,
} from "../../shared/types/tradeTypes";
import { reportApi, openPdfBlob } from "../../entities/trades/model/reportApi";

type TradeMode = "sale" | "purchase";

// ─── Кнопка PDF с локальным состоянием загрузки ───────────────────────────
function PdfButton({ row, isSale }: { row: OrderResponse | SupplierOrderResponse; isSale: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            if (isSale) {
                const saleRow = row as OrderResponse;
                const blob = await reportApi.generateOrderPDF({
                    documentNumber: saleRow.documentNumber,
                    orderDate: saleRow.createdAt
                        ? new Date(saleRow.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "",
                    customerName: saleRow.customerName ?? "",
                    status: saleRow.status ?? "",
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
                });
                openPdfBlob(blob, `Order_${saleRow.documentNumber}.pdf`);
            } else {
                const purchaseRow = row as SupplierOrderResponse;
                const blob = await reportApi.generateSupplierOrderPDF({
                    documentNumber: purchaseRow.documentNumber,
                    orderDate: purchaseRow.createdAt
                        ? new Date(purchaseRow.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "",
                    expectedDeliveryDate: purchaseRow.expectedDeliveryDate
                        ? new Date(purchaseRow.expectedDeliveryDate).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "",
                    supplierName: purchaseRow.supplierName ?? "",
                    supplierContactPerson: purchaseRow.supplierContactPerson ?? "",
                    supplierPhone: purchaseRow.supplierPhone ?? "",
                    warehouseName: purchaseRow.warehouseName ?? "",
                    warehouseAddress: purchaseRow.warehouseAddress ?? "",
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
                });
                openPdfBlob(blob, `SupplierOrder_${purchaseRow.documentNumber}.pdf`);
            }
        } catch (e) {
            console.error("Ошибка генерации PDF", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title="Скачать PDF" arrow>
            <span>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    disabled={loading}
                    sx={{ color: "#CB673C", "&:hover": { backgroundColor: "rgba(203,103,60,0.08)" } }}
                >
                    {loading
                        ? <CircularProgress size={18} sx={{ color: "#CB673C" }} />
                        : <PictureAsPdfIcon fontSize="small" />}
                </IconButton>
            </span>
        </Tooltip>
    );
}

// ─── Главная страница ────────────────────────────────────────────────────────
export default function TradeJournalPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<TradeMode>("sale");
    const { canCreate } = usePermissions();

    const { useGetOrders, useGetSupplierOrders } = useTrade();

    const { data: salesData, isLoading: isLoadingSales, error: errorSales } = useGetOrders();
    const { data: purchasesData, isLoading: isLoadingPurchases, error: errorPurchases } = useGetSupplierOrders();

    const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: TradeMode | null) => {
        if (newMode) setMode(newMode);
    };

    const isSale = mode === "sale";
    const currentData = isSale ? salesData : purchasesData;
    const isLoading = isSale ? isLoadingSales : isLoadingPurchases;
    const error = isSale ? errorSales : errorPurchases;

    const { defaultMRTOptions, columns } = useTradeTableConfig(isSale);

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: currentData || [],
        enableRowActions: true,
        positionActionsColumn: "last",
        renderRowActions: ({ row }) => (
            <PdfButton row={row.original} isSale={isSale} />
        ),
        muiTableHeadCellProps: (props) => ({
            ...(typeof defaultMRTOptions.muiTableHeadCellProps === "function"
                ? (defaultMRTOptions.muiTableHeadCellProps as any)(props)
                : defaultMRTOptions.muiTableHeadCellProps),
            // Заголовок колонки действий — пустой
        }),
        displayColumnDefOptions: {
            "mrt-row-actions": {
                header: "",
                size: 60,
            },
            "mrt-row-expand": {
                muiTableHeadCellProps: { sx: { color: "#CB673C" } },
            },
        },
        enableExpanding: true,
        muiExpandButtonProps: {
            sx: { color: "#CB673C" },
        },
        muiTableContainerProps: { sx: { height: "65vh" } },

        renderDetailPanel: ({ row }) => {
            const items: (OrderStructureResponse | SupplierOrderStructureResponse)[] =
                row.original.items || [];

            return (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        m: 1,
                        bgcolor: "#FAFAFA",
                        border: "1px dashed #CB673C",
                        borderRadius: "6px",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1.5, fontWeight: 700, color: "#A04E2B" }}
                    >
                        Состав документа — {isSale ? "Продажа" : "Закупка"}
                        <Chip
                            label={`${items.length} позиц.`}
                            size="small"
                            sx={{
                                ml: 1.5,
                                bgcolor: "#F5DBCF",
                                color: "#422112",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                            }}
                        />
                    </Typography>

                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    "& th": {
                                        fontWeight: 700,
                                        color: "#757575",
                                        bgcolor: "#F5F5F5",
                                        borderBottom: "2px solid #F5DBCF",
                                    },
                                }}
                            >
                                <TableCell>#</TableCell>
                                <TableCell>Наименование товара</TableCell>
                                <TableCell align="right">Количество</TableCell>
                                <TableCell align="right">Цена</TableCell>
                                <TableCell align="right">Итого</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        "&:last-child td": { border: 0 },
                                        "&:hover": { bgcolor: "#FFF5F0" },
                                    }}
                                >
                                    <TableCell sx={{ color: "#9e9e9e", width: 40 }}>
                                        {index + 1}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {item.productName || "—"}
                                    </TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                    <TableCell align="right">
                                        {item.price != null
                                            ? `${Number(item.price).toLocaleString("ru-RU")} ₽`
                                            : "—"}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ fontWeight: 700, color: isSale ? "#1565C0" : "#137333" }}
                                    >
                                        {item.totalPrice != null
                                            ? `${Number(item.totalPrice).toLocaleString("ru-RU")} ₽`
                                            : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                        sx={{ py: 3, color: "#9e9e9e", fontStyle: "italic" }}
                                    >
                                        Спецификация документа пуста
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            );
        },

        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    size="small"
                    sx={{
                        bgcolor: "background.paper",
                        "& .MuiToggleButton-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2.5,
                            "&.Mui-selected": {
                                backgroundColor: "#CB673C",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#A04E2B" },
                            },
                        },
                    }}
                >
                    <ToggleButton value="sale">
                        <ShoppingCartCheckoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Продажи
                    </ToggleButton>
                    <ToggleButton value="purchase">
                        <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
                        Закупки
                    </ToggleButton>
                </ToggleButtonGroup>

                {canCreate && (
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => navigate(isSale ? "/trade/sale" : "/trade/purchase")}
                        sx={{
                            backgroundColor: "#CB673C",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#A04E2B", boxShadow: "none" },
                        }}
                    >
                        {isSale ? "Оформить продажу" : "Оформить закупку"}
                    </Button>
                )}
            </Box>
        ),
    });

    if (isLoading) return <Loading />;
    if (error) return <ErrorBlock content="Ошибка при загрузке журнала торговых операций!" />;

    return (
        <Layout titlePage="Учёт торговых операций">
            <MaterialReactTable table={table} />
        </Layout>
    );
}