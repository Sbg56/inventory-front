import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef
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
    Paper
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import Layout from "../../shared/ui/layout/Layout";
import { useTrade } from "../../entities/trades/model/useTrade";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";

type TradeMode = "sale" | "purchase";

export default function TradeJournalPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<TradeMode>("sale");

    const { useGetOrders, useGetSupplierOrders } = useTrade();

    // Загрузка данных с бэкенда
    const { data: salesData, isLoading: isLoadingSales, error: errorSales } = useGetOrders();
    const { data: purchasesData, isLoading: isLoadingPurchases, error: errorPurchases } = useGetSupplierOrders();

    const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: TradeMode | null) => {
        if (newMode) setMode(newMode);
    };

    const isSale = mode === "sale";
    const currentData = isSale ? salesData : purchasesData;
    const isLoading = isSale ? isLoadingSales : isLoadingPurchases;
    const error = isSale ? errorSales : errorPurchases;

    // Конфигурация колонок в зависимости от выбранного режима
    const columns = useMemo<MRT_ColumnDef<any>[]>(() => {
        const baseColumns: MRT_ColumnDef<any>[] = [
            {
                accessorKey: "documentNumber",
                header: "Номер документа",
                muiTableBodyCellProps: { sx: { fontWeight: 600, color: "#422112" } }
            },
            {
                accessorKey: "createdAt",
                header: "Дата",
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    return value
                        ? new Date(value).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "—";
                }
            }
        ];

        if (isSale) {
            baseColumns.push({
                accessorKey: "customerName",
                header: "Покупатель (Клиент)",
                Cell: ({ cell }) => cell.getValue() || "—"
            });
        } else {
            baseColumns.push(
                {
                    accessorKey: "supplierName",
                    header: "Поставщик",
                    Cell: ({ cell }) => cell.getValue() || "—"
                },
                {
                    accessorKey: "warehouseName",
                    header: "Склад поступления",
                    Cell: ({ cell }) => cell.getValue() || "—"
                }
            );
        }

        baseColumns.push(
            {
                accessorKey: "totalAmount",
                header: "Сумма",
                Cell: ({ cell }) => {
                    const value = cell.getValue<number>();
                    return `${value?.toLocaleString("ru-RU") ?? 0} ₽`;
                },
                muiTableBodyCellProps: { sx: { fontWeight: 700, color: isSale ? "#1565C0" : "#137333" } }
            },
            {
                accessorKey: "notes",
                header: "Примечание",
                Cell: ({ cell }) => cell.getValue() || "—"
            }
        );

        return baseColumns;
    }, [isSale]);

    // Инициализация MaterialReactTable
    const table = useMaterialReactTable({
        columns,
        data: currentData || [],
        enableDensityToggle: false,
        initialState: { density: "comfortable" },

        // Включение функционала раскрывающихся подтаблиц
        renderDetailPanel: ({ row }) => {
            const items = row.original.items || [];
            return (
                <Paper
                    variant="outlined"
                    sx={{ p: 2, m: 1, bgcolor: "#FAFAFA", border: "1px dashed #CB673C", borderRadius: "6px" }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: "#A04E2B" }}>
                        Состав документа ({isSale ? "Продажа" : "Закупка"})
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& th": { fontWeight: 600, color: "#757575", bgcolor: "#F5F5F5" } }}>
                                <TableCell>Наименование товара</TableCell>
                                <TableCell align="right">Количество</TableCell>
                                <TableCell align="right">Цена</TableCell>
                                <TableCell align="right">Итого</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item: any, index: number) => (
                                <TableRow key={item.id || index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell>{item.productName || `Товар (ID: ${item.productId})`}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                    <TableCell align="right">
                                        {item.price ? `${item.price.toLocaleString("ru-RU")} ₽` : "—"}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                        {item.totalPrice ? `${item.totalPrice.toLocaleString("ru-RU")} ₽` : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 2, color: "#9e9e9e" }}>
                                        Спецификация документа пуста
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            );
        },
    });

    if (isLoading) return <Loading />;
    if (error) return <ErrorBlock content="Ошибка при загрузке журнала торговых операций!" />;

    return (
        <Layout titlePage="Учёт торговых операций">
            <Box sx={{ p: 3 }}>
                {/* Верхняя панель управления */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#422112" }}>
                            {isSale ? "Журнал продаж" : "Журнал закупок"}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        {/* Переключатель справа сверху */}
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
                                        "&:hover": { backgroundColor: "#A04E2B" }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="sale">
                                <ShoppingCartCheckoutIcon fontSize="small" sx={{ mr: 1 }} /> Продажи
                            </ToggleButton>
                            <ToggleButton value="purchase">
                                <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} /> Закупки
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Кнопка переброса на функцию создания */}
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => navigate(isSale ? "/trade/sale" : "/trade/purchase")}
                            sx={{
                                backgroundColor: "#CB673C",
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "none",
                                "&:hover": { backgroundColor: "#A04E2B", boxShadow: "none" }
                            }}
                        >
                            {isSale ? "Оформить продажу" : "Оформить закупку"}
                        </Button>
                    </Box>
                </Box>

                {/* Вывод таблицы */}
                <MaterialReactTable table={table} />
            </Box>
        </Layout>
    );
}