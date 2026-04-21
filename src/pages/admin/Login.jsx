import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, ShoppingCart, Store, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import mstitle from '../../assets/mstitle.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPortalSelect, setShowPortalSelect] = useState(false);
  
  const navigate = useNavigate();
  const { 
    isEcommerceAdmin, 
    isOfflineStoreAdmin, 
    adminRole, 
    loading: authLoading 
  } = useAuth();

  const [loginLoading, setLoginLoading] = useState(false);

  // Synchronize Portal Selection with AuthContext
  useEffect(() => {
    if (isEcommerceAdmin && isOfflineStoreAdmin) {
      setShowPortalSelect(true);
    } else {
      setShowPortalSelect(false);
    }
  }, [isEcommerceAdmin, isOfflineStoreAdmin]);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      triggerError('Email address is required.');
      return;
    }
    if (!password) {
      triggerError('Password is required.');
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Logic for redirection is handled by AdminProtectedRoute or the useEffect above
      toast.success("Identity verified.");
    } catch (err) {
      console.error(err);
      triggerError('Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden">
      
      {/* Original Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://t3.ftcdn.net/jpg/05/57/94/00/360_F_557940053_E5Dow60meC0PufggPTKxtIIGDmaX0a6O.jpg")' }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Dynamic Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1BAFAF]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div 
        className={`w-full max-w-[420px] mx-4 relative transition-all duration-500 ${shake ? 'animate-shake' : ''}`}
        style={{ perspective: '1000px' }}
      >
        {/* Glassmorphism Container with Premium Border */}
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/20 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden">
          
          {/* Top Bar macOS-style dots */}
          <div className="flex gap-1.5 px-8 pt-6">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
          </div>

          <AnimatePresence mode="wait">
            {!showPortalSelect ? (
              <motion.div 
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-8 pt-8 pb-14"
              >
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                  <img src={mstitle} alt="MayaSindhu" className="h-16 w-auto object-contain mb-4 drop-shadow-md" />
                  <p className="text-[13px] text-white font-medium uppercase tracking-wider opacity-80">Welcome Back</p>
                </div>

                {/* Error Message */}
                <div className={`overflow-hidden transition-all duration-300 ${error ? 'h-10 opacity-100 mb-4' : 'h-0 opacity-0'}`}>
                  <div className="flex items-center justify-center gap-2 text-[#FF5F57] bg-[#FF5F57]/10 py-2 rounded-xl border border-[#FF5F57]/20">
                    <AlertCircle size={14} />
                    <p className="text-[12px] font-bold uppercase">{error}</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} noValidate className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[14px] text-white outline-none focus:border-[#1BAFAF]/50 transition-all"
                        placeholder="admin@mayasindhu.com"
                      />
                      <Mail className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#1BAFAF]" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-[14px] text-white outline-none focus:border-[#1BAFAF]/50 transition-all"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#1BAFAF]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/30 hover:text-white uppercase">
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading || authLoading}
                    className="w-full bg-[#1BAFAF] text-white py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-[#17a0a0] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loginLoading || authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <span className="text-[15px] font-bold">Sign In</span> <ArrowRight className="w-4 h-4" /> </>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="portal-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-8 pt-8 pb-14"
              >
                <div className="flex flex-col items-center mb-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#1BAFAF]/10 border border-[#1BAFAF]/30 flex items-center justify-center mb-4">
                     <ArrowRight className="text-[#1BAFAF] rotate-[-45deg]" size={32} />
                  </div>
                  <h2 className="text-[20px] font-bold text-white mb-1">Select Your Workspace</h2>
                  <p className="text-[12px] text-white/50 uppercase tracking-widest font-medium">Multiple roles detected</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#1BAFAF]/50 p-5 rounded-3xl flex items-center gap-5 transition-all group/card"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform">
                      <ShoppingCart size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold text-white">E-Commerce Panel</p>
                      <p className="text-[11px] text-white/40 uppercase tracking-widest">Online Store Management</p>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover/card:text-[#1BAFAF] transition-all" />
                  </button>

                  <button 
                    onClick={() => navigate('/admin-offline/dashboard')}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 p-5 rounded-3xl flex items-center gap-5 transition-all group/card"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/card:scale-110 transition-transform">
                      <Store size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold text-white">Offline Shop Panel</p>
                      <p className="text-[11px] text-white/40 uppercase tracking-widest">In-Store Management</p>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover/card:text-amber-500 transition-all" />
                  </button>
                </div>

                <div className="mt-8 text-center">
                   <button 
                    onClick={() => signOut(auth)}
                    className="text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors"
                   >
                      Back to Login
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
