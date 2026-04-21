import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * AdminProtectedRoute component
 * @param {boolean} requireAuth - If true, only authenticated users can access. If false, only guests can access.
 */
const AdminProtectedRoute = ({ children, requireAuth = true }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Intentionally NOT setting loading to true here to avoid wiping out the beautiful login UI
      // with a white spinner screen during the 200ms background DB check.
      if (authUser) {
        try {
          const q = query(collection(db, 'admins'), where('email', '==', authUser.email.toLowerCase()));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const adminData = snapshot.docs[0].data();
            if (adminData.status === 'Active') {
              setRole(adminData.role);
              setUser(authUser); // strictly only set when they are a confirmed active admin
            } else {
              setUser(null);
              setRole(null);
            }
          } else {
            setUser(null);
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching admin role:", error);
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
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
    
    // Explicit Role Check: Prevent standard Admins from accessing Super Admin routes
    if (location.pathname.startsWith('/superadmin') && role !== 'Super Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else {
    // If auth is NOT required (Guest Only) but user IS logged in, redirect to correct dashboard
    if (user) {
      if (role === 'Super Admin') {
        return <Navigate to="/superadmin/dashboard" replace />;
      }
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

export default AdminProtectedRoute;
