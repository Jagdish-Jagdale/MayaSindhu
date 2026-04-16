import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, User, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const recentOrders = [
    { id: 'MS-8291', date: 'Oct 12, 2025', status: 'Delivered', total: 12500, image: '/src/assets/p3.jpeg' },
    { id: 'MS-7102', date: 'Sep 28, 2025', status: 'In Transit', total: 8500, image: '/src/assets/p1.jpeg' }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-8 rounded-[3rem] mb-6 text-center">
              <div className="w-24 h-24 bg-brand-orange/10 mx-auto rounded-full flex items-center justify-center mb-4 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-fashion font-bold text-brand-orange">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-fashion font-bold text-[#1A1A1A]">{user.displayName || 'Guest User'}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>

            <nav className="bg-white rounded-[3rem] overflow-hidden p-4">
              <ProfileNavLink icon={<Package size={20} />} label="My Orders" active />
              <ProfileNavLink icon={<User size={20} />} label="Personal Info" />
              <ProfileNavLink icon={<Heart size={20} />} label="My Wishlist" />
              <ProfileNavLink icon={<Settings size={20} />} label="Settings" />
              <div className="border-t border-gray-50 mt-4 pt-4">
                <ProfileNavLink 
                  icon={<LogOut size={20} />} 
                  label="Logout" 
                  danger 
                  onClick={handleLogout}
                />
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Recent Orders</h3>
                <Link to="/orders" className="text-sm font-bold text-brand-orange border-b border-brand-orange/20 pb-1">View All</Link>
              </div>

              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-6 p-6 border border-gray-50 rounded-[2.5rem] hover:border-brand-orange/10 transition-colors group">
                    <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={order.image} alt="Product" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Order ID</p>
                          <h4 className="text-lg font-fashion font-bold text-[#1A1A1A]">{order.id}</h4>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">{order.date}</p>
                        <p className="font-bold text-[#1A1A1A]">₹{order.total.toLocaleString()}</p>
                      </div>
                    </div>

                    <ChevronRight size={20} className="text-gray-300 group-hover:text-brand-orange transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Address Management - Card */}
            <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm">
              <h3 className="text-2xl font-fashion font-bold text-[#1A1A1A] mb-8">Shipping Address</h3>
              <div className="p-8 border-2 border-dashed border-gray-100 rounded-[3rem] relative">
                <p className="font-bold text-[#1A1A1A] mb-2 font-fashion">Home Address</p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  42nd Heritage Row, Near City Palace,<br />
                  Jaipur, Rajasthan, 302001<br />
                  India
                </p>
                <button className="text-sm font-bold text-brand-orange">Edit Address</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ProfileNavLink({ icon, label, active, danger, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${active ? 'bg-brand-orange/5 text-brand-orange font-bold' :
        danger ? 'text-red-400 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-[14px]">{label}</span>
      </div>
      <ChevronRight size={16} className={active ? 'opacity-100' : 'opacity-0'} />
    </button>
  );
}
