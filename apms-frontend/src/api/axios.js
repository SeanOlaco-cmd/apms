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

// If the server says our token is no longer valid (expired, or revoked by
// "log out of all devices"), clear the session and go to login instead of
// leaving the user on a page where nothing loads. A wrong password at the
// login form is also a 401, so that request is excluded.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;