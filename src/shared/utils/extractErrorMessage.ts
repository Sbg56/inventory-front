import {AxiosError} from "axios";


//утилита для извлечения текста ошибки
export const extractErrorMessage= (error: unknown): string => {
    if (error instanceof AxiosError) {

        if (error.response) {

            const data = error.response.data;

            if (typeof data === "string" && data) {
                return data
            }

            if (data && typeof data === "object" && 'message' in data && data.message) {
                return String(data.message);
            }
            return `Ошибка ${error.response?.status}: ${error.message}`;
        }

        if (error.request) {
            if (error.code === "ECONNREFUSED") {
                return "Время ошидания истекло"
            }
            return "Сервер не отвечает"
        }
    }
    return (error as Error)?.message || "Произошла непредвиденная ошибка!";
}