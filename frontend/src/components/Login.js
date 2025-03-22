// src/components/Login.js
import React, { useState, useContext } from 'react';
import { login } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { setAuthToken, setUsername } = useContext(AuthContext);
  const [username, setUsernameInput] = useState('');
  const [password, setPasswordInput] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(username, password);
      setAuthToken(data.token);
      setUsername(username);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPasswordInput(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
