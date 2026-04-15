import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Sidebar from '../components/admin/Sidebar';
import TopNav from '../components/admin/TopNav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        navigate('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-gray">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="flex h-screen bg-[#f5f5f7] p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-black/5 overflow-hidden transition-all duration-500">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth no-scrollbar">
          <Outlet />
        </main>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}


