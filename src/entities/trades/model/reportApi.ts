import api from "../../../shared/api/axios/axiosInstance";
import type { OrderReportRequest, SupplierOrderReportRequest } from "../../../shared/types/reportTypes";

export const reportApi = {
    generateOrderPDF: async (request: OrderReportRequest): Promise<Blob> => {
        const response = await api.post("/api/inventory/reports/order", request, {
            responseType: "blob",
        });
        return response.data;
    },

    generateSupplierOrderPDF: async (request: SupplierOrderReportRequest): Promise<Blob> => {
        const response = await api.post("/api/inventory/reports/supplier-order", request, {
            responseType: "blob",
        });
        return response.data;
    },
};

export function openPdfBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
