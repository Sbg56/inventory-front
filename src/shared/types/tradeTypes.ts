export interface OrderStructureRequest {
    productId: number;
    quantity: number;
}

export interface OrderStructureResponse {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface OrderRequest {
    documentNumber: string;
    fromWarehouseId: number;
    customerName?: string;
    notes?: string;
    clientId?: number;
    items: OrderStructureRequest[];
}

export interface OrderResponse {
    status?: string;
    id: number;
    documentNumber: string;
    customerName?: string;
    fromWarehouseId: number;
    totalAmount: number;
    notes?: string;
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
    notes?: string;
    supplierId?: number;
    items: SupplierOrderStructureRequest[];
}

export interface SupplierOrderStructureResponse {
    productId: number;
    productName: string;
    sku?: string;
    unit?: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface SupplierOrderResponse {
    id: number;
    supplierName?: string;
    supplierContactPerson?: string;
    supplierPhone?: string;
    warehouseName?: string;
    warehouseAddress?: string;
    warehouseId?: number;
    documentNumber: string;
    totalAmount: number;
    status?: string;
    notes?: string;
    items: SupplierOrderStructureResponse[];
    orderDate?: string;
    expectedDeliveryDate?: string;
    createdAt?: string;
}