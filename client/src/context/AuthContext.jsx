import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cra_token'));
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    // Load demo users for quick role switching
    api.getDemoUsers()
      .then(setDemoUsers)
      .catch((err) => console.error('Failed to load demo users', err));

    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('cra_token');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('cra_token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('cra_token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cra_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (username) => {
    try {
      const data = await api.switchDemoUser(username);
      localStorage.setItem('cra_token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to switch demo user', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        login,
        register,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
