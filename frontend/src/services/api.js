import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') && 
                window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getSocialRedirectUrl = (provider) => `http://localhost:8000/auth/${provider}/redirect`;

export default api;

