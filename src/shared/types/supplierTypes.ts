export interface SupplierResponse {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    inn: string;
    notes: string;
    isActive: boolean;
}

export interface SupplierRequest {
    name: string;
    contactPersonId: number;
    phone: string;
    email: string;
    address: string;
    inn: string;
    notes: string;
    isActive: boolean;
}

