import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            return { success: true, user: data.user };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            return { success: false };
        } finally { setLoading(false); }
    };

    const register = async (name, email, password, phone) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', { name, email, password, phone });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
            return { success: false };
        } finally { setLoading(false); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (updatedUser) => {
        const merged = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
