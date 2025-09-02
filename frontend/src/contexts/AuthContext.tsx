import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextOnly';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; username: string; email: string; role?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
    }
  }, []);


  const login = async (email: string, password: string) => {
    const res = await import('../api').then(api => api.login(email, password));
    setUser(res.user);
    setToken(res.token);
    // Ensure role is stored
    localStorage.setItem('auth', JSON.stringify({ user: res.user, token: res.token }));
    localStorage.setItem('token', res.token); // Always store token for admin fetch
    console.log('JWT token after login:', res.token);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await import('../api').then(api => api.register(username, email, password));
    setUser(res.user);
    setToken(res.token);
    // Ensure role is stored
    localStorage.setItem('auth', JSON.stringify({ user: res.user, token: res.token }));
    localStorage.setItem('token', res.token); // Always store token for admin fetch
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


