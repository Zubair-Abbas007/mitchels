import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/Adminuser';  // ✅ Without .jsx
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import ForgotPassword from './pages/ForgotPassword';
import BulkOrder from './pages/BulkOrder';
import AdminVendors from './pages/AdminVendors';
import Wishlist from './pages/Wishlist';
import ChatBot from './components/ChatBot';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Navbar />
      <ChatBot />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={<SignupRedirect />} />
        <Route path="/about" element={<About />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/bulk-order" element={<ProtectedRoute><BulkOrder /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute adminOnly={true}><AdminVendors /></ProtectedRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Redirect helpers for public routes
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Home />;
  return isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/products" />;
};

const LoginRedirect = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />;
};

const SignupRedirect = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />;
};

// Wrapper for protected routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default App;