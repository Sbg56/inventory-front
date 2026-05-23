// ProductTable.tsx
// @ts-ignore
import React, { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useQuery } from '@tanstack/react-query';

// Типизация согласно вашему ProductResponse
interface Product {
    id: number;
    sku: string;
    name: string;
    categoryName: string;
    supplierName: string;
    unit: string;
    isActive: boolean;
}

const ProductTable = ({ categoryId = 1 }) => { // Пока захардкодим 1

    const { data, isLoading, isError } = useQuery({
        queryKey: ['products', categoryId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8082/api/v1/product/get-all/${categoryId}`);
            return response.json();
        },
    });

    const columns = useMemo<MRT_ColumnDef<Product>[]>(() => [
        { accessorKey: 'sku', header: 'SKU' },
        { accessorKey: 'name', header: 'Название' },
        { accessorKey: 'categoryName', header: 'Категория' },
        { accessorKey: 'supplierName', header: 'Поставщик' },
        { accessorKey: 'unit', header: 'Ед. изм.' },
    ], []);

    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка загрузки данных</div>;

    return (
        <MaterialReactTable
            columns={columns}
            data={data || []}
        />
    );
};

export default ProductTable;