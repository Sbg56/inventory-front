import { useState, useMemo } from "react";
import {
    Box, Tab, Tabs, Chip, Typography,
    Menu, MenuItem, Divider, IconButton, Tooltip,
} from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import Layout from "../../shared/ui/layout/Layout";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import { useSuppliers } from "../../entities/suppliers/model/useSuppliers";
import { useEmployees } from "../../entities/employees/model/useEmployees";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { useCategories } from "../../entities/category/model/useCategories";
import { getDefaultMRTOptions } from "../../shared/utils/defaultTableOptions";
import type { SupplierResponse } from "../../shared/types/supplierTypes";
import type { EmployeeResponse } from "../../shared/types/employeeTypes";
import type { ProductResponse } from "../../shared/types/productTypes";

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ isActive }: { isActive: boolean }) {
    return (
        <Chip
            label={isActive ? "Активен" : "Неактивен"}
            size="small"
            sx={{
                backgroundColor: isActive ? "#E6F4EA" : "#FCE8E6",
                color: isActive ? "#137333" : "#C5221F",
                fontWeight: 600,
            }}
        />
    );
}

// ─── Suppliers tab ────────────────────────────────────────────────────────────

function SuppliersHistory() {
    const { useGetAllSuppliers } = useSuppliers();
    const { data: suppliers = [], isLoading, isError } = useGetAllSuppliers();

    const inactive = useMemo(() => suppliers.filter((s) => !s.isActive), [suppliers]);

    const columns = useMemo<MRT_ColumnDef<SupplierResponse>[]>(
        () => [
            { accessorKey: "name", header: "Название", enableSorting: true },
            { accessorKey: "contactPerson", header: "Контактное лицо" },
            { accessorKey: "phone", header: "Телефон", enableSorting: false },
            { accessorKey: "email", header: "Email", enableSorting: false },
            { accessorKey: "inn", header: "ИНН", enableSorting: false },
            {
                accessorKey: "isActive",
                header: "Статус",
                Cell: ({ row }) => <StatusChip isActive={row.original.isActive} />,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        ...getDefaultMRTOptions<SupplierResponse>(),
        columns,
        data: inactive,
        state: { isLoading },
        enableRowActions: false,
        muiTableContainerProps: { sx: { height: "70vh" } },
    });

    if (isLoading) return <Loading content="Загрузка поставщиков..." />;
    if (isError) return <ErrorBlock content="Ошибка при загрузке поставщиков!" />;

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Деактивированные поставщики: {inactive.length} из {suppliers.length}
            </Typography>
            <MaterialReactTable table={table} />
        </Box>
    );
}

// ─── Employees tab ────────────────────────────────────────────────────────────

function EmployeesHistory() {
    const { useGetAllEmployees } = useEmployees();
    const { data: employees = [], isLoading, isError } = useGetAllEmployees();

    const inactive = useMemo(() => employees.filter((e) => !e.isActive), [employees]);

    const columns = useMemo<MRT_ColumnDef<EmployeeResponse>[]>(
        () => [
            { accessorKey: "name", header: "Имя сотрудника", enableSorting: true },
            { accessorKey: "email", header: "Email", enableSorting: true },
            { accessorKey: "phone", header: "Телефон", enableSorting: false },
            { accessorKey: "status", header: "Должность", enableSorting: true },
            {
                accessorKey: "isActive",
                header: "Статус",
                Cell: ({ row }) => <StatusChip isActive={row.original.isActive} />,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        ...getDefaultMRTOptions<EmployeeResponse>(),
        columns,
        data: inactive,
        state: { isLoading },
        enableRowActions: false,
        muiTableContainerProps: { sx: { height: "70vh" } },
    });

    if (isLoading) return <Loading content="Загрузка сотрудников..." />;
    if (isError) return <ErrorBlock content="Ошибка при загрузке сотрудников!" />;

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Деактивированные сотрудники: {inactive.length} из {employees.length}
            </Typography>
            <MaterialReactTable table={table} />
        </Box>
    );
}

// ─── Products tab (с выбором категории как в ProductTable) ───────────────────

function ProductsHistory() {
    const { useGetAllCategories } = useCategories();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetAllCategories();

    const [currentCatId, setCurrentCatId] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    // Выбираем первую категорию по умолчанию
    const activeCatId = currentCatId ?? (categories[0]?.id ?? null);

    const { useGetAllProductsByCategory } = useGetProducts();
    const {
        data: products = [],
        isLoading: isProductsLoading,
        isError,
    } = useGetAllProductsByCategory(activeCatId ?? 0, activeCatId !== null);

    const inactive = useMemo(() => products.filter((p) => !p.isActive), [products]);

    const selectedCategory = categories.find((c) => c.id === activeCatId);

    const columns = useMemo<MRT_ColumnDef<ProductResponse>[]>(
        () => [
            { accessorKey: "sku", header: "Артикул (SKU)", enableSorting: true },
            { accessorKey: "name", header: "Наименование", enableSorting: true },
            { accessorKey: "supplierName", header: "Поставщик", enableSorting: true },
            { accessorKey: "warehouseName", header: "Место хранения", enableSorting: true },
            { accessorKey: "barcode", header: "Штрих-код" },
            {
                accessorKey: "currentStock",
                header: "Количество",
                Cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
            },
            {
                accessorKey: "isActive",
                header: "Статус",
                Cell: ({ row }) => <StatusChip isActive={row.original.isActive} />,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        ...getDefaultMRTOptions<ProductResponse>(),
        columns,
        data: inactive,
        state: { isLoading: isProductsLoading },
        enableRowActions: false,
        muiTableContainerProps: { sx: { height: "65vh" } },

        // Кнопка выбора категории в тулбаре
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Tooltip title="Выбрать категорию" arrow>
                    <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                        <AutoAwesomeMotionIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                </Tooltip>

                {selectedCategory && (
                    <Typography variant="body2" sx={{ color: "#CB673C", fontWeight: 600 }}>
                        {selectedCategory.name}
                    </Typography>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 200,
                                borderRadius: "8px",
                                boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            px: 2,
                            py: 0.5,
                            borderBottom: "1px solid #f0f0f0",
                            mb: 0.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ color: "#9e9e9e", fontWeight: "bold" }}
                        >
                            {isCategoriesLoading ? "Загрузка..." : "Категории"}
                        </Typography>
                    </Box>

                    {categories.map((category) => {
                        const isSelected = category.id === activeCatId;
                        return (
                            <MenuItem
                                key={category.id}
                                onClick={() => {
                                    setCurrentCatId(category.id);
                                    setAnchorEl(null);
                                }}
                                sx={{
                                    fontSize: "14px",
                                    mx: 0.5,
                                    my: 0.2,
                                    borderRadius: "6px",
                                    color: isSelected ? "#CB673C" : "inherit",
                                    fontWeight: isSelected ? 600 : 400,
                                    backgroundColor: isSelected
                                        ? "rgba(203, 103, 60, 0.08)"
                                        : "transparent",
                                    "&:hover": {
                                        backgroundColor: isSelected
                                            ? "rgba(203, 103, 60, 0.15)"
                                            : "rgba(0,0,0,0.04)",
                                    },
                                }}
                            >
                                {category.name}
                            </MenuItem>
                        );
                    })}

                    <Divider sx={{ my: 1 }} />
                    <MenuItem disabled sx={{ fontSize: "12px", color: "#9e9e9e", justifyContent: "center" }}>
                        Только просмотр
                    </MenuItem>
                </Menu>
            </Box>
        ),
    });

    if (isError) return <ErrorBlock content="Ошибка при загрузке товаров!" />;

    return (
        <Box>
            {activeCatId !== null && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedCategory
                        ? `Категория «${selectedCategory.name}» — деактивированные товары: ${inactive.length} из ${products.length}`
                        : "Выберите категорию"}
                </Typography>
            )}
            <MaterialReactTable table={table} />
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabValue = "products" | "suppliers" | "employees";

export default function HistoryPage() {
    const [tab, setTab] = useState<TabValue>("products");

    return (
        <Layout titlePage="История">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v: TabValue) => setTab(v)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab value="products" label="Товары" />
                    <Tab value="suppliers" label="Поставщики" />
                    <Tab value="employees" label="Сотрудники" />
                </Tabs>
            </Box>

            {tab === "products" && <ProductsHistory />}
            {tab === "suppliers" && <SuppliersHistory />}
            {tab === "employees" && <EmployeesHistory />}
        </Layout>
    );
}