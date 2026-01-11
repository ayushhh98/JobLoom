import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            console.log("AuthContext: Checking token...", token ? "Found" : "Not Found");
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    console.log("AuthContext: /auth/me response", res.data);
                    if (res.data.success) {
                        setUser(res.data.data);
                    } else {
                        console.warn("AuthContext: /auth/me failed (success=false), clearing token");
                        localStorage.removeItem('token');
                    }
                } catch (err) {
                    console.error("AuthContext: Auth check failed", err);
                    localStorage.removeItem('token');
                }
            } else {
                // console.log("AuthContext: No token found");
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password, role) => {
        const endpoint = role === 'admin' ? '/auth/login' : '/auth/login'; // Adjust if admin has different endpoint
        // Actually typical app has one login. My previous Login.jsx used /auth/login for all.
        // But let's check Login.jsx logic.
        const res = await api.post('/auth/login', { email, password, role });
        if (res.data.success) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        } else {
            throw new Error(res.data.error || 'Login failed');
        }
    };

    const loginWithData = (token, userData) => {
        localStorage.setItem('token', token);
        // localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (userData) => {
        // This is more complex as we have different register endpoints.
        // Maybe just expose specific methods or let components call API and then `setUser`?
        // Better to let components handle API call for register, and then call a `setUser` or `login` helper if it auto-logs in.
        // Typically register flows might require email verification, so auto-login might not happen.
        // I'll leave register to components for now, or just provide a helper to set user state manually if needed.
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // window.location.href = '/login'; // Or use navigate in component
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser, loginWithData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
