import { type JSX } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Typography, Box, Button } from "@mui/material";
import {useGetProducts} from "../../entities/products/model/useGetProducts";
import {useProductsTableConfig} from "../../entities/products/ui/useProductsTableConfig";
import Loading from "../../shared/ui/base/Loading";
import ErrorBlock from "../../shared/ui/base/ErrorBlock";

export default function ProductTable(): JSX.Element {

    const catId = 4;

    const { data: productsData, isLoading, isError, error } =
        useGetProducts().useGetProductsByCategory(catId, true);

    const { columns, defaultMRTOptions } = useProductsTableConfig();

    const table = useMaterialReactTable({
        ...defaultMRTOptions,
        columns,
        data: productsData ?? [],

        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant='contained' color='primary'>
                    Добавить продукт
                </Button>
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

    return <MaterialReactTable table={table} />;
}