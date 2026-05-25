
export interface OrderStructureRequest {
    productId: number;
    quantity: number;
}

export interface OrderRequest {
    documentNumber: string;
    fromWarehouseId: number;
    clientId?: number;
    items: OrderStructureRequest[];
}

export interface OrderStructureResponse {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface OrderResponse {
    id: number;
    documentNumber: string;
    fromWarehouseId: number;
    totalAmount: number;
    items: OrderStructureResponse[];
    createdAt?: string;
}

export interface SupplierOrderStructureRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface SupplierOrderRequest {
    documentNumber: string;
    warehouseId: number;
    supplierId?: number;
    items: SupplierOrderStructureRequest[];
}

export interface SupplierOrderStructureResponse {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface SupplierOrderResponse {
    id: number;
    documentNumber: string;
    warehouseId: number;
    totalAmount: number;
    items: SupplierOrderStructureResponse[];
    createdAt?: string;
}