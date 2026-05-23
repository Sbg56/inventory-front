
export interface ProductResponse {
    id: number;
    sku: string;
    name: string;
    description: string;
    categoryName: string;
    supplierName: string;
    unit: string;
    weight: number;
    volume: number;
    minStock: number;
    maxStock: number;
    location: string;
    barcode: string;
    notes: string;
    isActive: boolean;
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
    minStock: number;
    maxStock: number;
    location: string;
    barcode: string;
    notes: string;
    isActive: boolean;
}