import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import { Toaster } from 'react-hot-toast';
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
import useOnlineStatus from './hooks/useOnlineStatus';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import Settings from './pages/admin/Settings';
import NotFound from './components/common/NotFound';

// Settings Sub-pages
import Banner from './pages/admin/settings/Banner';
import CuratedRealms from './pages/admin/settings/CuratedRealms';
import FeaturedTreasures from './pages/admin/settings/FeaturedTreasures';
import ArtisanBlooms from './pages/admin/settings/ArtisanBlooms';
import Stories from './pages/admin/settings/Stories';
import Purpose from './pages/admin/settings/Purpose';
import Testimonial from './pages/admin/settings/Testimonial';

import './App.css';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/user/Login';

function App() {
  const isOnline = useOnlineStatus();

  return (
    <Router>
      <AuthProvider>
        <TitleUpdater />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#fff',
              color: '#333',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '16px',
              padding: '12px 20px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#1BAFAF',
                secondary: '#fff',
              },
            },
          }}
        />
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
          <Route path="/admin/login" element={
            <AdminProtectedRoute requireAuth={false}>
              <AdminLogin />
            </AdminProtectedRoute>
          } />

          {/* Admin Route */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/banner" element={<Banner />} />
            <Route path="settings/curated-realms" element={<CuratedRealms />} />
            <Route path="settings/featured-treasures" element={<FeaturedTreasures />} />
            <Route path="settings/artisan-blooms" element={<ArtisanBlooms />} />
            <Route path="settings/stories" element={<Stories />} />
            <Route path="settings/purpose" element={<Purpose />} />
            <Route path="settings/testimonial" element={<Testimonial />} />
          </Route>

          {/* Catch-all Route for 404 - Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
