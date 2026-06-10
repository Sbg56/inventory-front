import React, { useMemo, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    Skeleton,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import Layout from "../../shared/ui/layout/Layout";
import { useStatistics } from "../../entities/statistics/model/useStatistics";

const BRAND = "#CB6233";
const BRAND_DARK = "#9E4720";
const PURCHASE_COLOR = "#2E7D32";
const NEUTRAL = "#78909C";

const PIE_COLORS = [
    "#CB6233", "#E08863", "#F5A87E", "#2E7D32", "#66BB6A",
    "#1565C0", "#42A5F5", "#6A1B9A", "#AB47BC", "#F57F17",
];

type Period = "week" | "month" | "all";

function formatShortRub(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М ₽`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₽`;
    return `${value} ₽`;
}

function getMonthKey(date: Date) {
    const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getDayKey(date: Date) {
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

interface StatCardProps {
    title: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
}

function StatCard({ title, value, sub, icon, color, loading }: StatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "100%",
            }}
        >
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color,
                    flexShrink: 0,
                    "& svg": { fontSize: 22 },
                }}
            >
                {icon}
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
                    {title}
                </Typography>
                {loading ? (
                    <Skeleton width={110} height={30} />
                ) : (
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                )}
                {sub && (
                    <Typography variant="caption" color="text.secondary">
                        {sub}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, minWidth: 170 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {label}
                </Typography>
                {payload.map((entry: any, i: number) => (
                    <Box key={i} display="flex" justifyContent="space-between" gap={2}>
                        <Typography variant="body2" color={entry.color} fontWeight={600}>
                            {entry.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                            {typeof entry.value === "number" ? formatShortRub(entry.value) : entry.value}
                        </Typography>
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

// Wrapper that breaks out of Layout's Container constraint
const FullWidthWrapper = ({ children }: { children: React.ReactNode }) => (
    <Box
        sx={{
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
        }}
    >
        {children}
    </Box>
);

export default function StatisticsPage() {
    const { orders, supplierOrders, orderStructures, isLoading } = useStatistics();
    const [period, setPeriod] = useState<Period>("month");

    const totalSalesAmount = useMemo(
        () => orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
        [orders]
    );
    const totalPurchasesAmount = useMemo(
        () => supplierOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
        [supplierOrders]
    );
    const profit = totalSalesAmount - totalPurchasesAmount;
    const totalDocs = orders.length + supplierOrders.length;

    function filterByPeriod<T extends { createdAt?: string }>(items: T[]): T[] {
        if (period === "all") return items;
        const now = new Date();
        const cutoff = new Date();
        if (period === "week") cutoff.setDate(now.getDate() - 7);
        if (period === "month") cutoff.setMonth(now.getMonth() - 1);
        return items.filter((item) => {
            if (!item.createdAt) return true;
            return new Date(item.createdAt) >= cutoff;
        });
    }

    const filteredOrders = useMemo(() => filterByPeriod(orders), [orders, period]);
    const filteredSupplierOrders = useMemo(() => filterByPeriod(supplierOrders), [supplierOrders, period]);

    const turnoverData = useMemo(() => {
        const map = new Map<string, { sales: number; purchases: number }>();
        const getKey = period === "all" ? getMonthKey : getDayKey;
        filteredOrders.forEach((o) => {
            const key = o.createdAt ? getKey(new Date(o.createdAt)) : "—";
            const cur = map.get(key) ?? { sales: 0, purchases: 0 };
            cur.sales += o.totalAmount ?? 0;
            map.set(key, cur);
        });
        filteredSupplierOrders.forEach((o) => {
            const key = o.createdAt ? getKey(new Date(o.createdAt)) : "—";
            const cur = map.get(key) ?? { sales: 0, purchases: 0 };
            cur.purchases += o.totalAmount ?? 0;
            map.set(key, cur);
        });
        return Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, vals]) => ({ date, ...vals }));
    }, [filteredOrders, filteredSupplierOrders, period]);

    const topProductsData = useMemo(() => {
        const map = new Map<string, { quantity: number; revenue: number }>();
        orderStructures.forEach((item: any) => {
            const name = item.productName ?? "—";
            const cur = map.get(name) ?? { quantity: 0, revenue: 0 };
            cur.quantity += Number(item.quantity ?? 0);
            cur.revenue += Number(item.totalPrice ?? 0);
            map.set(name, cur);
        });
        return Array.from(map.entries())
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10)
            .map(([name, vals]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, ...vals }));
    }, [orderStructures]);

    const topRevenueData = useMemo(() => {
        const map = new Map<string, number>();
        orderStructures.forEach((item: any) => {
            const name = item.productName ?? "—";
            map.set(name, (map.get(name) ?? 0) + Number(item.totalPrice ?? 0));
        });
        const sorted = Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        const total = sorted.reduce((s, [, v]) => s + v, 0);
        return sorted.map(([name, value]) => ({
            name: name.length > 22 ? name.slice(0, 20) + "…" : name,
            value,
            pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
        }));
    }, [orderStructures]);

    const supplierData = useMemo(() => {
        const map = new Map<string, number>();
        filteredSupplierOrders.forEach((o) => {
            const name = (o as any).supplierName ?? "Без поставщика";
            map.set(name, (map.get(name) ?? 0) + (o.totalAmount ?? 0));
        });
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, amount]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, amount }));
    }, [filteredSupplierOrders]);

    const renderPlaceholder = (height = 300) => (
        <Box height={height} display="flex" alignItems="center" justifyContent="center">
            <Typography color="text.disabled" variant="body2">
                Нет данных за выбранный период
            </Typography>
        </Box>
    );

    const chartPaperSx = {
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        height: "100%",
    };

    return (
        <Layout titlePage="Статистика товарооборота">
            <FullWidthWrapper>
                {/* Header */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                    flexWrap="wrap"
                    gap={1.5}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            Аналитика и товарооборот
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Сводная статистика продаж, закупок и оборота товаров
                        </Typography>
                    </Box>
                    <ToggleButtonGroup
                        value={period}
                        exclusive
                        onChange={(_, v) => v && setPeriod(v)}
                        size="small"
                        sx={{
                            "& .MuiToggleButton-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2.5,
                                "&.Mui-selected": {
                                    backgroundColor: BRAND,
                                    color: "#fff",
                                    "&:hover": { backgroundColor: BRAND_DARK },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="week">Неделя</ToggleButton>
                        <ToggleButton value="month">Месяц</ToggleButton>
                        <ToggleButton value="all">Всё время</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* KPI Cards — 4 equal columns */}
                <Grid container spacing={2} mb={2}>
                    {[
                        {
                            title: "Выручка (продажи)",
                            value: formatShortRub(totalSalesAmount),
                            sub: `${orders.length} документов`,
                            icon: <TrendingUpIcon />,
                            color: BRAND,
                        },
                        {
                            title: "Закупки",
                            value: formatShortRub(totalPurchasesAmount),
                            sub: `${supplierOrders.length} документов`,
                            icon: <LocalShippingIcon />,
                            color: PURCHASE_COLOR,
                        },
                        {
                            title: "Валовая прибыль",
                            value: formatShortRub(profit),
                            sub: profit >= 0 ? "Положительная" : "Отрицательная",
                            icon: profit >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
                            color: profit >= 0 ? PURCHASE_COLOR : "#C62828",
                        },
                        {
                            title: "Всего документов",
                            value: `${totalDocs}`,
                            sub: `${orderStructures.length} строк спецификаций`,
                            icon: <InventoryIcon />,
                            color: NEUTRAL,
                        },
                    ].map((card, i) => (
                        <Grid item xs={12} sm={6} lg={3} key={i}>
                            <StatCard {...card} loading={isLoading} />
                        </Grid>
                    ))}
                </Grid>

                {/* Main chart grid: left col (area + supplier) | right col (top products + pie) */}
                <Grid container spacing={2}>
                    {/* LEFT column */}
                    <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Area chart */}
                        <Paper elevation={0} sx={chartPaperSx}>
                            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                                Динамика товарооборота
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                                Продажи и закупки по{" "}
                                {period === "week"
                                    ? "дням недели"
                                    : period === "month"
                                        ? "дням месяца"
                                        : "месяцам"}
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={210} sx={{ borderRadius: 2 }} />
                            ) : turnoverData.length === 0 ? (
                                renderPlaceholder(210)
                            ) : (
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart
                                        data={turnoverData}
                                        margin={{ top: 5, right: 16, left: 10, bottom: 5 }}
                                    >
                                        <defs>
                                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                                            </linearGradient>
                                            <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PURCHASE_COLOR} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={PURCHASE_COLOR} stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={formatShortRub} tick={{ fontSize: 11 }} width={68} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            formatter={(v) => (v === "sales" ? "Продажи" : "Закупки")}
                                            wrapperStyle={{ fontSize: 12 }}
                                        />
                                        <Area type="monotone" dataKey="sales" name="sales" stroke={BRAND} strokeWidth={2.5} fill="url(#salesGrad)" />
                                        <Area type="monotone" dataKey="purchases" name="purchases" stroke={PURCHASE_COLOR} strokeWidth={2.5} fill="url(#purchasesGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>

                        {/* Supplier bar */}
                        <Paper elevation={0} sx={chartPaperSx}>
                            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                                Закупки по поставщикам
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                                Сумма закупок по контрагентам за выбранный период
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                            ) : supplierData.length === 0 ? (
                                renderPlaceholder(200)
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={supplierData} margin={{ top: 5, right: 16, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={formatShortRub} tick={{ fontSize: 11 }} width={68} />
                                        <Tooltip formatter={(v: number) => [formatShortRub(v), "Сумма закупок"]} />
                                        <Bar dataKey="amount" name="amount" fill={PURCHASE_COLOR} radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>
                    </Grid>

                    {/* RIGHT column */}
                    <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Top products bar */}
                        <Paper elevation={0} sx={chartPaperSx}>
                            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                                Топ товаров по объёму продаж
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                                Количество единиц, реализованных по всем документам
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
                            ) : topProductsData.length === 0 ? (
                                renderPlaceholder(240)
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                                        <Tooltip
                                            formatter={(v: number, name) =>
                                                name === "quantity" ? [`${v} ед.`, "Кол-во"] : [formatShortRub(v), "Выручка"]
                                            }
                                        />
                                        <Legend formatter={(v) => v === "quantity" ? "Кол-во продаж" : "Выручка"} wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="quantity" name="quantity" fill={BRAND} radius={[0, 5, 5, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>

                        {/* Pie */}
                        <Paper elevation={0} sx={chartPaperSx}>
                            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                                Доля выручки по товарам
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                Топ-8 товаров по сумме продаж
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                            ) : topRevenueData.length === 0 ? (
                                renderPlaceholder(160)
                            ) : (
                                <Box display="flex" gap={2} alignItems="flex-start">
                                    <Box flexShrink={0} width={170}>
                                        <ResponsiveContainer width={170} height={170}>
                                            <PieChart>
                                                <Pie
                                                    data={topRevenueData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={52}
                                                    outerRadius={82}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {topRevenueData.map((_, index) => (
                                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => [formatShortRub(value), "Выручка"]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                    <Box flex={1} minWidth={0} pt={0.5}>
                                        {topRevenueData.map((item, i) => (
                                            <Box key={i} display="flex" alignItems="center" justifyContent="space-between" mb={0.6}>
                                                <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                                    <Typography variant="caption" noWrap sx={{ maxWidth: 160 }}>
                                                        {item.name}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                                                    {item.pct}%
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </FullWidthWrapper>
        </Layout>
    );
}