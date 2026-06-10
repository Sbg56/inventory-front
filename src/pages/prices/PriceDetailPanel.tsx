import { useState } from "react";
import * as React from "react";
import {
    Box, Typography, CircularProgress, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Paper,
    Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type {PriceRequest, PriceResponse} from "../../shared/types/priceTypes";
import {useGetPrices} from "../../entities/prices/model/useGetPrices";

// ─── helpers ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const isActivePrice = (price: PriceResponse) =>
    price.isActive !== false && (!price.validTo || price.validTo >= today());

const fmt = (n: number | null | undefined) =>
    n != null ? `${Number(n).toLocaleString("ru-RU")} ₽` : "—";

const fmtPct = (n: number | null | undefined) =>
    n != null ? `${n}%` : "—";

// ─── Add / Edit modal ─────────────────────────────────────────────────────────

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
                color: "#A04E2B",
                borderBottom: "1px solid #F5DBCF",
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

                <DialogActions sx={{ p: 2, backgroundColor: "#fafafa", borderTop: "1px solid #F5DBCF" }}>
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
                            backgroundColor: "#CB673C",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                            borderRadius: "6px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#A04E2B", boxShadow: "none" },
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

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function PriceDetailPanel({ productId }: { productId: number }) {
    const { usePricesByProductId, useDeactivatePrice } = useGetPrices();
    const { data: prices, isLoading } = usePricesByProductId(productId);
    const deactivateMutation = useDeactivatePrice(productId);

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<PriceResponse | null>(null);

    if (isLoading) {
        return (
            <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: "#CB673C" }} />
                <Typography variant="body2" sx={{ color: "#A04E2B", fontSize: "0.8rem" }}>
                    Загрузка цен...
                </Typography>
            </Box>
        );
    }

    const activePrices = prices?.filter(isActivePrice) ?? [];
    const archivedPrices = prices?.filter(p => !isActivePrice(p)) ?? [];

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
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#A04E2B" }}>
                        Цены на товар
                    </Typography>
                    {prices && prices.length > 0 && (
                        <Chip
                            label={`${activePrices.length} актив.`}
                            size="small"
                            sx={{
                                bgcolor: "#F5DBCF",
                                color: "#422112",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                            }}
                        />
                    )}
                </Box>
                <Tooltip title="Добавить цену" arrow>
                    <IconButton
                        size="small"
                        onClick={() => setAddOpen(true)}
                        sx={{
                            color: "#CB673C",
                            border: "1px solid #F5DBCF",
                            borderRadius: "6px",
                            width: 28,
                            height: 28,
                            "&:hover": { backgroundColor: "#FFF5F0", borderColor: "#CB673C" },
                        }}
                    >
                        <AddCircleOutlineIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* No prices */}
            {(!prices || prices.length === 0) && (
                <Box sx={{
                    py: 3,
                    textAlign: "center",
                    border: "1px dashed #F5DBCF",
                    borderRadius: "6px",
                }}>
                    <Typography variant="body2" sx={{ color: "#CB673C", fontSize: "0.8rem", fontStyle: "italic" }}>
                        Цены не заданы
                    </Typography>
                </Box>
            )}

            {/* Active prices */}
            {activePrices.length > 0 && (
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{
                            "& th": {
                                fontWeight: 700,
                                color: "#757575",
                                bgcolor: "#F5F5F5",
                                borderBottom: "2px solid #F5DBCF",
                            },
                        }}>
                            <TableCell>#</TableCell>
                            <TableCell>Закупочная</TableCell>
                            <TableCell>Продажная</TableCell>
                            <TableCell>Оптовая</TableCell>
                            <TableCell>Маржа</TableCell>
                            <TableCell>Действует с</TableCell>
                            <TableCell>Действует до</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activePrices.map((price, index) => (
                            <TableRow
                                key={price.priceId}
                                sx={{
                                    "&:last-child td": { border: 0 },
                                    "&:hover": { bgcolor: "#FFF5F0" },
                                }}
                            >
                                <TableCell sx={{ color: "#9e9e9e", width: 40 }}>
                                    {index + 1}
                                </TableCell>
                                <TableCell sx={{ color: "#444" }}>
                                    {fmt(price.purchasePrice)}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#1565C0" }}>
                                    {fmt(price.sellingPrice)}
                                </TableCell>
                                <TableCell sx={{ color: "#555" }}>
                                    {fmt(price.wholesalePrice)}
                                </TableCell>
                                <TableCell sx={{ color: "#137333", fontWeight: 600 }}>
                                    {fmtPct(price.margin)}
                                </TableCell>
                                <TableCell sx={{ color: "#888", fontSize: "0.78rem" }}>
                                    {price.validFrom ?? "—"}
                                </TableCell>
                                <TableCell sx={{ color: "#888", fontSize: "0.78rem" }}>
                                    {price.validTo ?? "∞"}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Редактировать" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => setEditTarget(price)}
                                            sx={{ color: "#CB673C", "&:hover": { bgcolor: "#FFF5F0" } }}
                                        >
                                            <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Деактивировать" arrow>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => deactivateMutation.mutate(price.priceId)}
                                                disabled={deactivateMutation.isPending}
                                                sx={{
                                                    color: "#bbb",
                                                    "&:hover": { color: "#d32f2f", bgcolor: "#FFF5F0" },
                                                    "&:disabled": { color: "#e0e0e0" },
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Archived prices */}
            {archivedPrices.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{
                        color: "#CB673C",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        mb: 1,
                        opacity: 0.7,
                    }}>
                        Архив ({archivedPrices.length})
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{
                                "& th": {
                                    fontWeight: 700,
                                    color: "#bdbdbd",
                                    bgcolor: "#F5F5F5",
                                    borderBottom: "2px solid #ebebeb",
                                },
                            }}>
                                <TableCell>#</TableCell>
                                <TableCell>Закупочная</TableCell>
                                <TableCell>Продажная</TableCell>
                                <TableCell>Оптовая</TableCell>
                                <TableCell>Маржа</TableCell>
                                <TableCell>Действует с</TableCell>
                                <TableCell>Действует до</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {archivedPrices.map((price, index) => (
                                <TableRow
                                    key={price.priceId}
                                    sx={{
                                        opacity: 0.5,
                                        "&:last-child td": { border: 0 },
                                        "&:hover": { bgcolor: "#fafafa" },
                                    }}
                                >
                                    <TableCell sx={{ color: "#9e9e9e", width: 40 }}>
                                        {index + 1}
                                    </TableCell>
                                    <TableCell sx={{ color: "#444" }}>{fmt(price.purchasePrice)}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#666" }}>{fmt(price.sellingPrice)}</TableCell>
                                    <TableCell sx={{ color: "#555" }}>{fmt(price.wholesalePrice)}</TableCell>
                                    <TableCell sx={{ color: "#888" }}>{fmtPct(price.margin)}</TableCell>
                                    <TableCell sx={{ color: "#aaa", fontSize: "0.78rem" }}>{price.validFrom ?? "—"}</TableCell>
                                    <TableCell sx={{ color: "#aaa", fontSize: "0.78rem" }}>{price.validTo ?? "—"}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Редактировать" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditTarget(price)}
                                                sx={{ color: "#ccc", "&:hover": { color: "#CB673C", bgcolor: "#FFF5F0" } }}
                                            >
                                                <EditIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
        </Paper>
    );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const sectionPaper = {
    p: 2,
    borderRadius: "8px",
    bgcolor: "#fafafa",
    borderColor: "#F5DBCF",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{
            color: "#A04E2B",
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