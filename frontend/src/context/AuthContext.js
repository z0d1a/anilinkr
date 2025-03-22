// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Save token and username to localStorage for persistence
  const updateAuthToken = (token) => {
    setAuthToken(token);
    localStorage.setItem('authToken', token);
  };

  const updateUsername = (name) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: updateAuthToken, username, setUsername: updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
