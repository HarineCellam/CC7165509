import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Home /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/income" element={user ? <Layout><Income /></Layout> : <Navigate to="/login" />} />
      <Route path="/expenses" element={user ? <Layout><Expenses /></Layout> : <Navigate to="/login" />} />
      <Route path="/budget" element={user ? <Layout><Budget /></Layout> : <Navigate to="/login" />} />
      <Route path="/reports" element={user ? <Layout><Reports /></Layout> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;