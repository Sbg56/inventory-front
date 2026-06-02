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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import Layout from "../../shared/ui/layout/Layout";
import { useTrade } from "../../entities/trades/model/useTrade";
import { useTradeTableConfig } from "../../entities/trades/ui/useTradeTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import type {
    OrderStructureResponse,
    SupplierOrderStructureResponse,
} from "../../shared/types/tradeTypes";

type TradeMode = "sale" | "purchase";

export default function TradeJournalPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<TradeMode>("sale");

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
        enableRowActions: false,
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
                                        <pre style={{fontSize: 10}}>{JSON.stringify(items[0], null, 2)}</pre>
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