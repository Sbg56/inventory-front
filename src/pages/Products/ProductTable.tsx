
import { type JSX } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {useGetProducts} from "../../entities/products/model/useGetProducts";
import {useProductsTableConfig} from "../../entities/products/ui/useProductsTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CreateProductModal from "../Products/CreateProductModal";
import { useState } from "react";
import {IconButton, Tooltip, Box, Typography, Menu, MenuItem, Divider} from '@mui/material';
import {useCategories} from "../../entities/category/model/useCategories";
import CreateCategoryModal from "../Categories/CreateCategoryModal";
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';

export default function ProductTable(): JSX.Element {

    const [currentCatId, setCurrentCatId] = useState<number>(4);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const { columns, defaultMRTOptions } = useProductsTableConfig();
    const { useGetAllCategories } = useCategories();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetAllCategories();

    const { data: productsData, isLoading, isError, error } =
        useGetProducts().useGetProductsByCategory(currentCatId);


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
        data: productsData ?? [],

        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

                <Tooltip title="Выбрать категорию" arrow>
                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        }}
                    >
                        <AutoAwesomeMotionIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Добавить продукт" arrow>
                    <IconButton
                        onClick={() => setIsCreateModalOpen(true)}
                        sx={{
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        }}
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

        muiTableContainerProps: { sx: { height: '75vh' } },

        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: !row.original.isActive ? '#f5f5f5' : '#ffffff',
                textDecoration: !row.original.isActive ? 'line-through' : 'none',
                color: !row.original.isActive ? '#9e9e9e' : 'inherit'
            }
        }),
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

            <CreateCategoryModal open={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} />
        </>
    );

}