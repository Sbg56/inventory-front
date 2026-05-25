export interface StockMovementRequest {
    documentNumber: string;
    productId: number | "";
    fromWarehouseId: number | "";
    toWarehouseId: number | "";
    quantity: number | "";
    price: number | "";
    notes: string;
}

export interface StockMovementResponse {
    id: number;
    documentNumber: string;
    productId: number;
    productName: string;
    fromWarehouseId: number;
    fromWarehouseName: string;
    toWarehouseId: number;
    toWarehouseName: string;
    quantity: number;
    price: number;
    totalAmount: number;
    movementDate: string;
    notes: string;
}