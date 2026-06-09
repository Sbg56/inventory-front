import axios from "axios";
import keycloak from "../../auth/keycloak";

const api = axios.create({
// ssh -R 80:localhost:5173 serveo.net 'https://rabiem.serveousercontent.com' || http://127.0.0.1:8082
    baseURL: import.meta.env.VITE_API_URL ||  ' http://127.0.0.1:8082',
    headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
    }
});

api.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
});

export default api;