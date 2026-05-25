
export interface ProductResponse {
    id: number;
    sku: string;
    name: string;
    description: string;
    categoryId: number;
    categoryName: string;
    supplierId: number;
    supplierName: string;
    unit: string;
    weight: number;
    volume: number;
    minStock: number;
    maxStock: number;
    currentStock: number;
    barcode: string;
    notes: string;
    isActive: boolean;
    warehouseId: number;
    warehouseName: string;
}

export interface ProductRequest {
    sku: string;
    name: string;
    description: string;
    categoryId: number;
    supplierId: number;
    unit: string;
    weight: number;
    volume: number;
    barcode: string;
    notes: string;
    warehouseId: number;
}