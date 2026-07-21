import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export const API_URL = 'http://localhost:5000/api/v1';

// Create API instance
export const adminApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize API request interceptor to attach JWT token
    useEffect(() => {
        const interceptor = adminApi.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('servicehub_admin_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Check if already logged in
        const loadAdmin = () => {
            const storedAdmin = localStorage.getItem('servicehub_admin_user');
            const storedToken = localStorage.getItem('servicehub_admin_token');
            if (storedAdmin && storedToken) {
                setAdmin(JSON.parse(storedAdmin));
            }
            setLoading(false);
        };

        loadAdmin();

        return () => {
            adminApi.interceptors.request.eject(interceptor);
        };
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (user.role !== 'admin') {
                throw new Error('Access denied. Only administrators can access this panel.');
            }

            localStorage.setItem('servicehub_admin_token', token);
            localStorage.setItem('servicehub_admin_user', JSON.stringify(user));
            setAdmin(user);
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('servicehub_admin_token');
        localStorage.removeItem('servicehub_admin_user');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, error, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
