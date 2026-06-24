import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // After a successful login we already have `user` from the login response.
    // Avoid calling `/me` immediately, so temporary backend/db issues don't log the
    // user out right after correct credentials.
    if (user) {
      setLoading(false);
      return;
    }

    loadUser();
  }, [token, user]);

  const loadUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch (err) {
      // Session verification failed (e.g., backend/db unreachable).
      // Clear token but avoid showing a misleading "Logged out" success toast.
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup without OTP
  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
      return { success: false };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      toast.success('Welcome back!');
      return { success: true, user: res.data.user };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register, // OTP removed
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};