// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('inkwell_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inkwell_token');
    if (!token) { setLoading(false); return; }

    api.getMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('inkwell_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('inkwell_token');
        localStorage.removeItem('inkwell_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    const { data } = await api.login({ identifier, password });
    localStorage.setItem('inkwell_token', data.token);
    localStorage.setItem('inkwell_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const { data } = await api.register({ username, email, password });
    localStorage.setItem('inkwell_token', data.token);
    localStorage.setItem('inkwell_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('inkwell_token');
    localStorage.removeItem('inkwell_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
