import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://apms-production-ef64.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;