import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import TitleUpdater from './components/common/TitleUpdater';

// User Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetail from './pages/user/ProductDetail';
import CategoryView from './pages/user/CategoryView';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import Profile from './pages/user/Profile';
import Checkout from './pages/user/Checkout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AdminLogin from './pages/admin/Login';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import AdminCart from './pages/admin/Cart';
import InventoryLogs from './pages/admin/InventoryLogs';
import useOnlineStatus from './hooks/useOnlineStatus';
import OfflineStatus from './components/common/OfflineStatus';
import NotFound from './components/common/NotFound';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import Settings from './pages/admin/Settings';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/user/Login';

function App() {
  const isOnline = useOnlineStatus();

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="category/:id" element={<CategoryView />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Admin Login Route (Standalone) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="cart" element={<Cart />} />
            <Route path="inventory-logs" element={<InventoryLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}



export default App
