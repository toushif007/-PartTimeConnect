import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.profile) {
          setProfile(meRes.data.profile);
        }
      } catch (e) {
        console.warn('Profile fetch after login notice:', e.message);
      }

      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      const { user: newUser, token: jwtToken } = res.data;
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.profile) {
          setProfile(meRes.data.profile);
        }
      } catch (e) {}

      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Could not refresh user session:', err.message);
    }
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfileState,
        isAuthenticated: !!user && !!token,
        isStudent: user?.role === 'student',
        isEmployer: user?.role === 'employer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
