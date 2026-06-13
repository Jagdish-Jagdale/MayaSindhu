import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import TitleUpdater from './components/common/TitleUpdater';
import ScrollToTop from './components/common/ScrollToTop';

// User Pages
import Home from './pages/user/Home';
import ProductDetail from './pages/user/ProductDetail';
import CategoryView from './pages/user/CategoryView';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import Profile from './pages/user/Profile';
import Checkout from './pages/user/Checkout';
import Blog from './pages/user/Blog';
import BlogDetail from './pages/user/BlogDetail';
import Terms from './pages/user/Terms';
import Privacy from './pages/user/Privacy';
import Disclaimer from './pages/user/Disclaimer';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AdminLogin from './pages/admin/Login';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';
import DeliveryCharges from './pages/admin/DeliveryCharges';
import Reviews from './pages/admin/Reviews';
import useOnlineStatus from './hooks/useOnlineStatus';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import Settings from './pages/admin/Settings';
import NotFound from './components/common/NotFound';
import OfflineDashboard from './pages/admin/offline/Dashboard';
import OfflineOrders from './pages/admin/offline/Orders';
import PurchaseOrdersOffline from './pages/admin/offline/PurchaseOrders';
import StoreCustomers from './pages/admin/offline/StoreCustomers';
import Vendors from './pages/admin/offline/Vendors';
import Returns from './pages/admin/offline/Returns';

// Super Admin Pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAdmins from './pages/superadmin/Admins';
import SuperAdminUsers from './pages/superadmin/Users';
import SuperAdminSuperAdmins from './pages/superadmin/SuperAdmins';


// Settings Sub-pages
import Banner from './pages/admin/settings/Banner';
import CuratedRealms from './pages/admin/settings/CuratedRealms';
import FeaturedTreasures from './pages/admin/settings/FeaturedTreasures';
import ArtisanBlooms from './pages/admin/settings/ArtisanBlooms';
import Stories from './pages/admin/settings/Stories';
import Purpose from './pages/admin/settings/Purpose';
import Testimonial from './pages/admin/settings/Testimonial';
import AboutUs from './pages/admin/settings/AboutUs';
import Blogs from './pages/admin/settings/Blogs';
import Workshops from './pages/admin/settings/Workshops';


import './App.css';

import { AuthProvider } from './context/AuthContext';
import { CartUIProvider } from './context/CartUIContext';
import Login from './pages/user/Login';

function App() {
  const isOnline = useOnlineStatus();

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartUIProvider>
          <TitleUpdater />
          <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#fff',
              color: '#333',
              fontFamily: "'Montserrat', sans-serif",
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
        <Login />
        <Cart />
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="collections" element={<CategoryView />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="product/:id/:slug" element={<ProductDetail />} />
            <Route path="c/*" element={<CategoryView />} />
            <Route path="cart" element={<Navigate to="/" replace />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="manifesto" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="/blog">
              <Route index element={<Blog />} />
              <Route path=":id" element={<BlogDetail />} />
            </Route>
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="disclaimer" element={<Disclaimer />} />
          </Route>

          {/* Standalone User Routes */}
          <Route path="/login" element={<Login />} />

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
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="delivery-charges" element={<DeliveryCharges />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/banner" element={<Banner />} />
            <Route path="settings/curated-realms" element={<CuratedRealms />} />
            <Route path="settings/featured-treasures" element={<FeaturedTreasures />} />
            <Route path="settings/artisan-blooms" element={<ArtisanBlooms />} />
            <Route path="settings/stories" element={<Stories />} />
            <Route path="settings/purpose" element={<Purpose />} />
            <Route path="settings/testimonial" element={<Testimonial />} />
            <Route path="settings/about-us" element={<AboutUs />} />
            <Route path="settings/blogs" element={<Blogs />} />
            <Route path="settings/artician-workshop" element={<Workshops />} />
          </Route>


          {/* Offline Store Route */}
          <Route path="/admin-offline" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin-offline/dashboard" replace />} />
            <Route path="dashboard" element={<OfflineDashboard />} />
            <Route path="orders" element={<OfflineOrders />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<StoreCustomers />} />
            <Route path="users" element={<Navigate to="/admin-offline/customers" replace />} />
            <Route path="return" element={<Returns />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="purchase-orders" element={<PurchaseOrdersOffline />} />
          </Route>

          {/* Super Admin Route */}
          <Route path="/superadmin" element={
            <AdminProtectedRoute>
              <SuperAdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="superadmins" element={<SuperAdminSuperAdmins />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Catch-all Route for 404 - Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </CartUIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
