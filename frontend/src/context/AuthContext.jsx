import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const login = async (usernameValue, password) => {
    const response = await loginRequest(usernameValue, password);
    const { token: nextToken, username: nextUsername } = response.data;

    localStorage.setItem('token', nextToken);
    localStorage.setItem('username', nextUsername);
    setToken(nextToken);
    setUsername(nextUsername);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    navigate('/login');
  };

  const value = useMemo(() => ({
    token,
    username,
    login,
    logout,
    isAuthenticated: Boolean(token),
  }), [token, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
