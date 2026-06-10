export interface EmployeeResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    isActive: boolean;
}

export interface EmployeeRequest {
    name: string;
    email: string;
    phone: string;
    status: string;
    isActive: boolean;
}