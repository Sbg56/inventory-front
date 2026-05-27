export interface PriceResponse {
    priceId: number;
    productId: number;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    margin: number;
    validFrom: string;
    validTo: string | null;
    isActive?: boolean;
}

export interface PriceRequest {
    productId: number;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    margin: number;
    validFrom: string;
    validTo: string | null;
}