import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setSimulatedRole(parsedUser.role);
          
          // Verify token is still valid with backend
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { access_token, role } = res.data;
      
      localStorage.setItem('token', access_token);
      const userProfile = { email, role };
      setUser(userProfile);
      setSimulatedRole(role);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      // Fetch full profile
      const profileRes = await API.get('/auth/me');
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.detail || "Invalid credentials. Try admin@fitzone.com / admin123" 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, role) => {
    try {
      await API.post('/auth/register', { email, password, role });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.detail || "Registration failed." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSimulatedRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      simulatedRole, 
      setSimulatedRole, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
