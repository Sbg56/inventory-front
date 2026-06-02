import axios from "axios";

const api = axios.create({
// ssh -R 80:localhost:5173 serveo.net 'https://rabiem.serveousercontent.com' ||
    baseURL: import.meta.env.VITE_API_URL ||  'http://127.0.0.1:8082',
    headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
    }
});

export default api;