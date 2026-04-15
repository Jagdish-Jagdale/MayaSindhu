import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetail from './pages/user/ProductDetail';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AdminLogin from './pages/admin/Login';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Cart from './pages/admin/Cart';
import InventoryLogs from './pages/admin/InventoryLogs';
import Settings from './pages/admin/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
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
    </Router>
  );
}



export default App
