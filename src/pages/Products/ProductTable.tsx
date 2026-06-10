import { type JSX } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useGetProducts } from "../../entities/products/model/useGetProducts";
import { usePermissions } from '../../shared/auth/usePermissions';
import { useProductsTableConfig } from "../../entities/products/ui/useProductsTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CreateProductModal from "../Products/CreateProductModal";
import EditProductModal from "../Products/EditProductModal";
import { useState } from "react";
import { IconButton, Tooltip, Box, Typography, Menu, MenuItem, Divider, Snackbar, Alert } from '@mui/material';
import { useCategories } from "../../entities/category/model/useCategories";
import CreateCategoryModal from "../Categories/CreateCategoryModal";
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";
import * as React from "react";
import type { ProductResponse } from "../../shared/types/productTypes";
import EditCategoryModal from "../Categories/EditCategoryModal";
import type { CategoryResponse } from "../../shared/types/categoryTypes";
import PriceDetailPanel from "../prices/PriceDetailPanel";

const ProductRowActions = ({
                               product,
                               onEdit,
                               showNotification
                           }: {
    product: ProductResponse;
    onEdit: () => void;
    showNotification: (msg: string, severity: "success" | "error") => void;
}) => {
    const { useUpdateProduct } = useGetProducts();
    const updateMutation = useUpdateProduct(product.id);
    const { canEdit, canDelete } = usePermissions();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();

        updateMutation.mutate({ isActive: false } as never, {
            onSuccess: () => {
                showNotification(`Товар "${product.name}" успешно удален`, "success");
            },
            onError: () => {
                showNotification(`Ошибка при удалении товара "${product.name}"`, "error");
            }
        });
    };

    return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && (
                <Tooltip title="Редактировать" arrow>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit();
                        }}
                        size="small"
                        sx={{ color: '#CB673C', '&:hover': { backgroundColor: 'rgba(203, 103, 60, 0.08)' } }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {canDelete && (
                <Tooltip title={product.isActive ? "Удалить (Деактивировать)" : "Товар уже неактивен"} arrow>
                    <IconButton
                        onClick={handleDelete}
                        size="small"
                        color="error"
                        disabled={!product.isActive}
                        sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' } }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default function ProductTable(): JSX.Element {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const { columns, defaultMRTOptions } = useProductsTableConfig();
    const { canCreate, canEdit, canDelete } = usePermissions();
    const navigate = useNavigate();
    const [currentCatId, setCurrentCatId] = useState<number>(4);

    const { useGetAllCategories, useDeleteCategory } = useCategories();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetAllCategories();
    const deleteCategoryMutation = useDeleteCategory();
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [selectedContextMenuCategory, setSelectedContextMenuCategory] = useState<CategoryResponse | null>(null);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

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

    const handleCategoryContextMenu = (event: React.MouseEvent, category: CategoryResponse) => {
        event.preventDefault();
        event.stopPropagation();

        setSelectedContextMenuCategory(category);
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null,
        );
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    const handleDeleteCategoryClick = () => {
        if (!selectedContextMenuCategory) return;

        const id = selectedContextMenuCategory.id;
        handleContextMenuClose();

        deleteCategoryMutation.mutate(id, {
            onSuccess: () => {
                setSnackbarMessage("Категория успешно удалена");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                if (currentCatId === id) {
                    setCurrentCatId(4);
                }
            },
            onError: (error: any) => {
                let errorMessage = "Произошла ошибка при удалении категории";
                if (error.response?.status === 409) {
                    errorMessage = error.response?.data?.message
                    || typeof error.response?.data === 'string' ? error.response.data : "Категорию нельзя удалить, так как в ней содержатся продукты.";
                }
                setSnackbarMessage(errorMessage);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        });
    };

    const showNotification = (msg: string, severity: "success" | "error") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: productsData || [],

        enableRowActions: true,
        positionActionsColumn: 'last',

        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: 'Действие',
                size: 100,
            },
        },

        enableExpanding: true,
        renderDetailPanel: ({ row }) => (
            <PriceDetailPanel productId={row.original.id} />
        ),

        renderRowActions: ({ row }) => (
            <ProductRowActions
                product={row.original}
                onEdit={() => {
                    setSelectedProduct(row.original);
                    setIsEditModalOpen(true);
                }}
                showNotification={showNotification} // <--- ВОТ ЭТА СТРОЧКА
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

                {canCreate && (
                    <Tooltip title="Добавить продукт" arrow>
                        <IconButton
                            onClick={() => setIsCreateModalOpen(true)}
                            sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                        >
                            <PlaylistAddIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Tooltip>
                )}

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

                    {(Array.isArray(categories) ? categories : []).map((category) => {
                        const isSelected = category.id === currentCatId;
                        return (
                            <MenuItem
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                onContextMenu={(e) => handleCategoryContextMenu(e, category)} // <--- СЮДА ДОБАВЛЯЕМ ПРАВЫЙ КЛИК
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
                    {canCreate && (
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
                    )}
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

            <CreateProductModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

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

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <EditCategoryModal
                open={isEditCategoryModalOpen}
                onClose={() => setIsEditCategoryModalOpen(false)}
                category={selectedContextMenuCategory}
            />

            <Menu
                open={contextMenu !== null}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }

                sx={{ zIndex: 1400 }}
                slotProps={{
                    paper: {
                        sx: { minWidth: 150, borderRadius: '8px', boxShadow: '0px 4px 16px rgba(0,0,0,0.15)' }
                    }
                }}
            >
                <MenuItem onClick={() => {
                    handleContextMenuClose();
                    setIsEditCategoryModalOpen(true);
                }}>
                    Редактировать
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteCategoryClick}
                    sx={{ color: 'error.main' }}
                >
                    Удалить
                </MenuItem>
            </Menu>
        </>
    );
}