import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  // const API_URL = 'http://localhost:5000/api';
  const VITE_BACKEND_URL =  `https://cc7165509.onrender.com/api`;
  axios.defaults.baseURL = VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token validity
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('/user/profile');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // const signup = async (name, email, password) => {
  //   try {
  //     const response = await axios.post('/auth/register', { name, email, password });
  //     const { token, user } = response.data;
      
  //     localStorage.setItem('token', token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     setUser(user);
      
  //     toast.success('Account created successfully!');
  //     return { success: true };
  //   } catch (error) {
  //     const message = error.response?.data?.message || 'Signup failed';
  //     toast.error(message);
  //     return { success: false, message };
  //   }
  // };

  const signup = async (name, email, password) => {
  try {
    const response = await axios.post('/auth/register', { name, email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);

    toast.success('Account created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Signup error:', error.response); // Add this line
    const message = error.response?.data?.message || 'Signup failed';
    toast.error(message);
    return { success: false, message };
  }
};
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axios.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};