import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        setToken(response.data.token);
        setUser(response.data.user);
    };

    const register = async (name, email, password, password_confirmation) => {
        const response = await api.post('/register', { name, email, password, password_confirmation });
        setToken(response.data.token);
        setUser(response.data.user);
    };

    const guestLogin = async () => {
        const response = await api.post('/guest-login');
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch(e) {}
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, setToken, loading, login, register, guestLogin, logout, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);

