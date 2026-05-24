import { type JSX } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { useProductsTableConfig } from "../../entities/products/ui/useProductsTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CreateProductModal from "../Products/CreateProductModal";
import EditProductModal from "../Products/EditProductModal"; // Импортируем модалку редактирования
import { useState } from "react";
import { IconButton, Tooltip, Box, Typography, Menu, MenuItem, Divider } from '@mui/material';
import { useCategories } from "../../entities/category/model/useCategories";
import CreateCategoryModal from "../Categories/CreateCategoryModal";
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import EditIcon from '@mui/icons-material/Edit'; // Иконка редактирования
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка удаления
import { useNavigate } from "react-router-dom";
import * as React from "react";
import type { ProductResponse } from "../../shared/types/productTypes";

// Выносим действия в отдельный компонент, чтобы безопасно использовать хук мутации для каждого ID
const ProductRowActions = ({
                               product,
                               onEdit
                           }: {
    product: ProductResponse;
    onEdit: () => void;
}) => {
    const { useUpdateProduct } = useGetProducts();
    const updateMutation = useUpdateProduct(product.id);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Останавливаем всплытие, чтобы не срабатывал double click по строке

        if (window.confirm(`Вы уверены, что хотите удалить (деактивировать) товар "${product.name}"?`)) {
            // Передаем частичное обновление (смена активности на false)
            updateMutation.mutate({ isActive: false } as never);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Редактировать" arrow>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем переход по dblclick
                        onEdit();
                    }}
                    size="small"
                    sx={{ color: '#CB673C', '&:hover': { backgroundColor: 'rgba(203, 103, 60, 0.08)' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title={product.isActive ? "Удалить (Деактивировать)" : "Товар уже неактивен"} arrow>
                <IconButton
                    onClick={handleDelete}
                    size="small"
                    color="error"
                    disabled={!product.isActive} // Если уже деактивирован, кнопка заблокирована
                    sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' } }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default function ProductTable(): JSX.Element {
    const [currentCatId, setCurrentCatId] = useState<number>(4);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Состояния для редактирования продукта
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const { columns, defaultMRTOptions } = useProductsTableConfig();
    const { useGetAllCategories } = useCategories();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetAllCategories();
    const navigate = useNavigate();

    const { data: productsData, isLoading, isError, error } =
        useGetProducts().useGetActiveProductsByCategory(currentCatId, true);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleCategorySelect = (id: number) => {
        setCurrentCatId(id);
        handleMenuClose();
    };
    const handleOpenCategoryModal = () => {
        handleMenuClose();
        setIsCreateCategoryModalOpen(true);
    };

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: productsData || [],

        // 1. Включаем отображение колонки действий
        enableRowActions: true,
        // Позиционируем колонку действий в самом конце таблицы справа
        positionActionsColumn: 'last',

        // Настройка заголовка колонки действий
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: 'Действие',
                size: 100,
            },
        },

        // 2. Рендерим кастомный компонент действий для каждой строки
        renderRowActions: ({ row }) => (
            <ProductRowActions
                product={row.original}
                onEdit={() => {
                    setSelectedProduct(row.original);
                    setIsEditModalOpen(true);
                }}
            />
        ),

        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Выбрать категорию" arrow>
                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                    >
                        <AutoAwesomeMotionIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Добавить продукт" arrow>
                    <IconButton
                        onClick={() => setIsCreateModalOpen(true)}
                        sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                    >
                        <PlaylistAddIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                </Tooltip>

                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    slotProps={{
                        paper: {
                            sx: { mt: 1, minWidth: 200, borderRadius: '8px', boxShadow: '0px 4px 16px rgba(0,0,0,0.08)' }
                        }
                    }}
                >
                    <Box sx={{ px: 2, py: 0.5, borderBottom: '1px solid #f0f0f0', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 'bold' }}>
                            {isCategoriesLoading ? 'Загрузка...' : 'Категории'}
                        </Typography>
                    </Box>

                    {categories.map((category) => {
                        const isSelected = category.id === currentCatId;
                        return (
                            <MenuItem
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                sx={{
                                    fontSize: '14px', mx: 0.5, my: 0.2, borderRadius: '6px',
                                    color: isSelected ? '#CB673C' : 'inherit',
                                    fontWeight: isSelected ? 600 : 400,
                                    backgroundColor: isSelected ? 'rgba(203, 103, 60, 0.08)' : 'transparent',
                                    '&:hover': { backgroundColor: isSelected ? 'rgba(203, 103, 60, 0.15)' : 'rgba(0,0,0,0.04)' },
                                }}
                            >
                                {category.name}
                            </MenuItem>
                        );
                    })}

                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                        onClick={handleOpenCategoryModal}
                        sx={{
                            fontSize: '14px', mx: 0.5, mb: 0.5, borderRadius: '6px',
                            color: '#CB673C', fontWeight: 'bold', justifyContent: 'center',
                            '&:hover': { backgroundColor: 'rgba(203, 103, 60, 0.08)' }
                        }}
                    >
                        + Добавить категорию
                    </MenuItem>
                </Menu>
            </Box>
        ),

        muiTableBodyRowProps: ({ row }) => ({
            onDoubleClick: () => {
                navigate(`/products/${row.original.id}`);
            },
            sx: {
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: '#FFF5F0',
                },
                backgroundColor: !row.original.isActive ? '#f5f5f5' : '#ffffff',
                textDecoration: !row.original.isActive ? 'line-through' : 'none',
                color: !row.original.isActive ? '#9e9e9e' : 'inherit'
            },
        }),

        muiTableContainerProps: { sx: { height: '75vh' } },
    });

    if (isLoading) {
        return <Loading content={"Загрузка продуктов..."} />;
    }

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <ErrorBlock content={"Ошибка при загрузке продуктов!"} />
                <Typography color="error" sx={{ mt: 1 }}>
                    {error instanceof Error ? error.message : String(error)}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <MaterialReactTable table={table} />

            <CreateProductModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Включаем модальное окно редактирования, передавая выбранный продукт */}
            {selectedProduct && (
                <EditProductModal
                    open={isEditModalOpen}
                    product={selectedProduct}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedProduct(null);
                    }}
                />
            )}

            <CreateCategoryModal open={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} />
        </>
    );
}