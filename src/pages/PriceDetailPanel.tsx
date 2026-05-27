import { useState } from "react";
import * as React from "react";
import {
    Box, Typography, CircularProgress, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Paper
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type {PriceRequest, PriceResponse} from "../shared/types/priceTypes";
import {useGetPrices} from "../entities/prices/model/useGetPrices";

// ─── helpers ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const isActivePrice = (price: PriceResponse) =>
    price.isActive !== false && (!price.validTo || price.validTo >= today());

const fmt = (n: number | null | undefined) =>
    n != null ? `${Number(n).toLocaleString("ru-RU")} ₽` : "—";

const fmtPct = (n: number | null | undefined) =>
    n != null ? `${n}%` : "—";

// ─── Add / Edit modal ────────────────────────────────────────────────────────

interface PriceModalProps {
    open: boolean;
    onClose: () => void;
    productId: number;
    initialData?: PriceResponse;
}

function PriceModal({ open, onClose, productId, initialData }: PriceModalProps) {
    const { useCreatePrice, useUpdatePrice } = useGetPrices();
    const createMutation = useCreatePrice(productId);
    const updateMutation = useUpdatePrice(initialData?.priceId ?? 0, productId);

    const isEdit = !!initialData;

    const emptyForm = (): PriceRequest => ({
        productId,
        purchasePrice: 0,
        sellingPrice: 0,
        wholesalePrice: 0,
        margin: 0,
        validFrom: today(),
        validTo: null,
    });

    const [form, setForm] = useState<PriceRequest>(
        initialData
            ? {
                productId: initialData.productId,
                purchasePrice: initialData.purchasePrice,
                sellingPrice: initialData.sellingPrice,
                wholesalePrice: initialData.wholesalePrice,
                margin: initialData.margin,
                validFrom: initialData.validFrom,
                validTo: initialData.validTo,
            }
            : emptyForm()
    );

    React.useEffect(() => {
        if (open) {
            setForm(
                initialData
                    ? {
                        productId: initialData.productId,
                        purchasePrice: initialData.purchasePrice,
                        sellingPrice: initialData.sellingPrice,
                        wholesalePrice: initialData.wholesalePrice,
                        margin: initialData.margin,
                        validFrom: initialData.validFrom,
                        validTo: initialData.validTo,
                    }
                    : emptyForm()
            );
        }
    }, [open, initialData]);

    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value || null,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && initialData) {
            const updates: Record<string, unknown> = { ...form };
            updateMutation.mutate(updates, { onSuccess: onClose });
        } else {
            createMutation.mutate(form, { onSuccess: onClose });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: "10px", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" } } }}
        >
            <DialogTitle sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#1a1a1a",
                borderBottom: "1px solid #f0f0f0",
                pb: 1.5,
                letterSpacing: "-0.2px",
            }}>
                {isEdit ? "Редактировать цену" : "Новая цена"}
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 2.5 }}>
                    <Grid container spacing={2}>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionLabel>Стоимость</SectionLabel>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Закупочная (₽)" name="purchasePrice" type="number"
                                            value={form.purchasePrice} onChange={handle}
                                            fullWidth required size="small"
                                            inputProps={{ min: 0, step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Продажная (₽)" name="sellingPrice" type="number"
                                            value={form.sellingPrice} onChange={handle}
                                            fullWidth required size="small"
                                            inputProps={{ min: 0, step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Оптовая (₽)" name="wholesalePrice" type="number"
                                            value={form.wholesalePrice} onChange={handle}
                                            fullWidth required size="small"
                                            inputProps={{ min: 0, step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Маржа (%)" name="margin" type="number"
                                            value={form.margin} onChange={handle}
                                            fullWidth size="small"
                                            inputProps={{ min: 0, step: "0.01" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={sectionPaper}>
                                <SectionLabel>Период действия</SectionLabel>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Действует с" name="validFrom" type="date"
                                            value={form.validFrom} onChange={handle}
                                            fullWidth required size="small"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Действует до (необязательно)" name="validTo" type="date"
                                            value={form.validTo ?? ""} onChange={handle}
                                            fullWidth size="small"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, backgroundColor: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                    <Button
                        onClick={onClose}
                        sx={{ color: "#6b6b6b", textTransform: "none", fontWeight: 500 }}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending}
                        sx={{
                            backgroundColor: "#1a1a1a",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                            borderRadius: "6px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#333", boxShadow: "none" },
                            "&:disabled": { backgroundColor: "#d4d4d4" },
                        }}
                    >
                        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить цену"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export default function PriceDetailPanel({ productId }: { productId: number }) {
    const { usePricesByProductId, useDeactivatePrice } = useGetPrices();
    const { data: prices, isLoading } = usePricesByProductId(productId);
    const deactivateMutation = useDeactivatePrice(productId);

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<PriceResponse | null>(null);

    if (isLoading) {
        return (
            <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: "#888" }} />
                <Typography variant="body2" sx={{ color: "#888", fontSize: "0.8rem" }}>
                    Загрузка цен...
                </Typography>
            </Box>
        );
    }

    const activePrices = prices?.filter(isActivePrice) ?? [];
    const archivedPrices = prices?.filter(p => !isActivePrice(p)) ?? [];

    return (
        <Box sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#fff",
            borderTop: "1px solid #ebebeb",
        }}>
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "#1a1a1a",
                }}>
                    Цены
                </Typography>
                <Tooltip title="Добавить цену" arrow>
                    <IconButton
                        size="small"
                        onClick={() => setAddOpen(true)}
                        sx={{
                            color: "#555",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            width: 28,
                            height: 28,
                            "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#bbb" },
                        }}
                    >
                        <AddCircleOutlineIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* No prices at all */}
            {(!prices || prices.length === 0) && (
                <Box sx={{
                    py: 3,
                    textAlign: "center",
                    border: "1px dashed #e0e0e0",
                    borderRadius: "8px",
                    mb: 1,
                }}>
                    <Typography variant="body2" sx={{ color: "#aaa", fontSize: "0.8rem" }}>
                        Цены не заданы
                    </Typography>
                </Box>
            )}

            {/* Active prices table */}
            {activePrices.length > 0 && (
                <Box sx={{
                    border: "1px solid #ebebeb",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}>
                    <PriceTable
                        prices={activePrices}
                        onEdit={setEditTarget}
                        onDelete={id => deactivateMutation.mutate(id)}
                        isPendingDelete={deactivateMutation.isPending}
                    />
                </Box>
            )}

            {/* Archived prices */}
            {archivedPrices.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{
                        color: "#aaa",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        mb: 1,
                    }}>
                        Архив ({archivedPrices.length})
                    </Typography>
                    <Box sx={{
                        border: "1px solid #ebebeb",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}>
                        <PriceTable
                            prices={archivedPrices}
                            onEdit={setEditTarget}
                            onDelete={id => deactivateMutation.mutate(id)}
                            isPendingDelete={deactivateMutation.isPending}
                            archived
                        />
                    </Box>
                </Box>
            )}

            {/* Modals */}
            <PriceModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                productId={productId}
            />
            {editTarget && (
                <PriceModal
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    productId={productId}
                    initialData={editTarget}
                />
            )}
        </Box>
    );
}

// ─── Price table ─────────────────────────────────────────────────────────────

interface PriceTableProps {
    prices: PriceResponse[];
    onEdit: (price: PriceResponse) => void;
    onDelete: (priceId: number) => void;
    isPendingDelete: boolean;
    archived?: boolean;
}

function PriceTable({ prices, onEdit, onDelete, isPendingDelete, archived = false }: PriceTableProps) {
    const cols: { label: string; width?: string }[] = [
        { label: "Статус",       width: "80px"  },
        { label: "Закупочная",   width: "120px" },
        { label: "Продажная",    width: "120px" },
        { label: "Оптовая",      width: "120px" },
        { label: "Маржа",        width: "80px"  },
        { label: "Действует с",  width: "110px" },
        { label: "Действует до", width: "110px" },
        { label: "",             width: "72px"  },
    ];

    return (
        <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <Box component="thead">
                    <Box component="tr" sx={{ backgroundColor: "#fafafa" }}>
                        {cols.map((col, i) => (
                            <Box
                                key={i}
                                component="th"
                                sx={{
                                    textAlign: "left",
                                    fontWeight: 600,
                                    fontSize: "0.68rem",
                                    color: "#aaa",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    py: 1,
                                    px: 1.5,
                                    width: col.width,
                                    borderBottom: "1px solid #ebebeb",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {col.label}
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box component="tbody">
                    {prices.map((price, idx) => (
                        <PriceRow
                            key={price.priceId}
                            price={price}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isPendingDelete={isPendingDelete}
                            archived={archived}
                            isLast={idx === prices.length - 1}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Price row ────────────────────────────────────────────────────────────────

interface PriceRowProps {
    price: PriceResponse;
    onEdit: (price: PriceResponse) => void;
    onDelete: (priceId: number) => void;
    isPendingDelete: boolean;
    archived: boolean;
    isLast?: boolean;
}

function PriceRow({ price, onEdit, onDelete, isPendingDelete, archived, isLast }: PriceRowProps) {
    const cell = {
        ...cellSx,
        borderBottom: isLast ? "none" : "1px solid #f5f5f5",
    };

    return (
        <Box
            component="tr"
            sx={{
                opacity: archived ? 0.5 : 1,
                "&:hover": { backgroundColor: "#fafafa" },
                transition: "background 0.1s",
            }}
        >
            <Box component="td" sx={cell}>
                <Chip
                    label={archived ? "Архив" : "Активна"}
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.2px",
                        backgroundColor: archived ? "#f0f0f0" : "#f0f0f0",
                        color: archived ? "#aaa" : "#444",
                        border: "1px solid",
                        borderColor: archived ? "#e0e0e0" : "#d0d0d0",
                    }}
                />
            </Box>
            <Box component="td" sx={{ ...cell, fontWeight: 500, color: "#444" }}>
                {fmt(price.purchasePrice)}
            </Box>
            <Box component="td" sx={{ ...cell, fontWeight: 700, color: "#1a1a1a" }}>
                {fmt(price.sellingPrice)}
            </Box>
            <Box component="td" sx={{ ...cell, color: "#555" }}>
                {fmt(price.wholesalePrice)}
            </Box>
            <Box component="td" sx={{ ...cell, color: "#666" }}>
                {fmtPct(price.margin)}
            </Box>
            <Box component="td" sx={{ ...cell, color: "#888", fontSize: "0.78rem" }}>
                {price.validFrom ?? "—"}
            </Box>
            <Box component="td" sx={{ ...cell, color: "#888", fontSize: "0.78rem" }}>
                {price.validTo ?? "∞"}
            </Box>
            <Box component="td" sx={{ ...cell, textAlign: "right" }}>
                <Tooltip title="Редактировать" arrow>
                    <IconButton
                        size="small"
                        onClick={() => onEdit(price)}
                        sx={{
                            color: "#888",
                            "&:hover": { color: "#1a1a1a", backgroundColor: "#f0f0f0" },
                        }}
                    >
                        <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Деактивировать" arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(price.priceId)}
                            disabled={isPendingDelete || archived}
                            sx={{
                                color: "#bbb",
                                "&:hover": { color: "#555", backgroundColor: "#f0f0f0" },
                                "&:disabled": { color: "#e0e0e0" },
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const cellSx = {
    px: 1.5,
    py: 1,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
};

const sectionPaper = {
    p: 2,
    borderRadius: "8px",
    bgcolor: "#fafafa",
    borderColor: "#ebebeb",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{
            color: "#555",
            fontWeight: 700,
            fontSize: "0.72rem",
            textTransform: "uppercase",
            mb: 1.5,
            letterSpacing: "0.5px",
        }}>
            {children}
        </Typography>
    );
}