import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminProtectedRoute component
 * Handles both authenticated administration access and guest-only access (login page).
 * @param {boolean} requireAuth - If true, only authenticated users can access. If false (guest mode), logged-in users are redirected away.
 */
const AdminProtectedRoute = ({ children, requireAuth = true }) => {
  const { 
    user, 
    loading, 
    adminRole: role, 
    isEcommerceAdmin, 
    isOfflineStoreAdmin 
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#e8e8ec]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1BAFAF]" />
      </div>
    );
  }

  if (requireAuth) {
    // If auth is required but user is not logged in, redirect to login
    if (!user) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    // 1. Super Admin: full access to everything
    if (role === 'Super Admin') return children;

    // 2. Portal-Specific Enforcement
    const isAccessingOffline = location.pathname.startsWith('/admin-offline');
    const isAccessingEcommerce = !isAccessingOffline && location.pathname.startsWith('/admin');

    if (isAccessingEcommerce && !isEcommerceAdmin) {
      // User is in E-Com portal but only has Offline permission
      if (isOfflineStoreAdmin) return <Navigate to="/admin-offline/dashboard" replace />;
      return <Navigate to="/admin/login" replace />;
    }

    if (isAccessingOffline && !isOfflineStoreAdmin) {
      // User is in Offline portal but only has E-Com permission
      if (isEcommerceAdmin) return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/admin/login" replace />;
    }

    // 3. Prevent specialized admins from hitting Super Admin routes
    if (location.pathname.startsWith('/superadmin') && role !== 'Super Admin') {
      if (isEcommerceAdmin) return <Navigate to="/admin/dashboard" replace />;
      if (isOfflineStoreAdmin) return <Navigate to="/admin-offline/dashboard" replace />;
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    // GUEST ONLY (Login Page)
    if (user) {
      if (role === 'Super Admin') return <Navigate to="/superadmin/dashboard" replace />;
      
      // If user has BOTH roles, DO NOT redirect from login page yet. 
      // This allows the Login component to show its "Portal Selection" UI.
      if (isEcommerceAdmin && isOfflineStoreAdmin) return children;

      if (isEcommerceAdmin) return <Navigate to="/admin/dashboard" replace />;
      if (isOfflineStoreAdmin) return <Navigate to="/admin-offline/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AdminProtectedRoute;
