export interface OrderItemReport {
    productName: string;
    sku: string;
    unit: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface OrderReportRequest {
    documentNumber: string;
    orderDate: string;
    customerName: string;
    status: string;
    notes: string;
    totalAmount: number;
    items: OrderItemReport[];
}

export interface SupplierOrderItemReport {
    productName: string;
    sku: string;
    unit: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface SupplierOrderReportRequest {
    documentNumber: string;
    orderDate: string;
    expectedDeliveryDate: string;
    supplierName: string;
    supplierContactPerson: string;
    supplierPhone: string;
    warehouseName: string;
    warehouseAddress: string;
    status: string;
    notes: string;
    totalAmount: number;
    items: SupplierOrderItemReport[];
}
