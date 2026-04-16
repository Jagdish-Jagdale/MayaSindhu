import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { Loader2 } from 'lucide-react';

/**
 * AdminProtectedRoute component
 * @param {boolean} requireAuth - If true, only authenticated users can access. If false, only guests can access.
 */
const AdminProtectedRoute = ({ children, requireAuth = true }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  } else {
    // If auth is NOT required (Guest Only) but user IS logged in, redirect to admin
    if (user) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

export default AdminProtectedRoute;
