import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    const storedUser = JSON.parse(window.localStorage.getItem('user'));
    
    console.log('AuthContext useEffect (Ajustado):');
    console.log('Token:', token);
    console.log('Stored User:', storedUser);

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (token, user) => {
    console.log('🔵 Login: Guardando token y usuario');
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));

    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = () => {
    console.log('🟠 Logout: Eliminando token y usuario');
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
