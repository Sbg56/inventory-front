export interface WarehouseResponse {
    id: number;
    name: string;
    address: string;
    employee: string;
    description: string;
}

export interface WarehouseRequest {
    name: string;
    address: string;
    employeeId: number;
    description: string;
}
