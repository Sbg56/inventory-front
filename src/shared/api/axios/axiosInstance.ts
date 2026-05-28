import axios from "axios";

const api = axios.create({
// ssh -R 80:localhost:5173 serveo.net
    baseURL: import.meta.env.VITE_API_URL || ' https://b81b58cb0368eaf9-176-126-83-224.serveousercontent.com' || 'http:/127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
    }
});

export default api;