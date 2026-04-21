import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import mstitle from '../../assets/mstitle.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Manual validation for iOS-like experience
    if (!email.trim()) {
      triggerError('Email address is required.');
      return;
    }
    if (!password) {
      triggerError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Verify role in Firestore
      const q = query(collection(db, 'admins'), where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Prevent login if not in the admins collection
        await signOut(auth);
        triggerError('Unauthorized access. Administrator profile not found.');
        return;
      }

      const adminData = querySnapshot.docs[0].data();
      
      if (adminData.status === 'Inactive') {
        await signOut(auth);
        triggerError('Account is inactive. Contact the Super Admin.');
        return;
      }

      const role = adminData.role;

      if (role === 'Super Admin') {
        toast.success("Authenticated Successfully. Welcome to Super Admin Panel.", {
          duration: 3000,
        });
        navigate('/superadmin/dashboard', { replace: true });
      } else {
        toast.success("Authenticated Successfully. Welcome to the Administrator Panel.", {
          duration: 3000,
        });
        navigate('/admin/dashboard', { replace: true });
      }

    } catch (err) {
      console.error('Login error:', err.code, err.message);
      const code = err?.code;
      let msg = '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (code === 'auth/user-disabled') {
        msg = 'This account has been disabled.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Try again later.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error. Check your connection.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else {
        msg = `Authentication failed. (${code || 'Unknown error'})`;
      }
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
    >
      {/* Shake style definition */}
      <style>{`
        @keyframes ios-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .shake { animation: ios-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* Background Image with Black Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{
          backgroundImage: 'url("https://t3.ftcdn.net/jpg/05/57/94/00/360_F_557940053_E5Dow60meC0PufggPTKxtIIGDmaX0a6O.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Glassy Floating Card */}
      <div
        className={`w-full max-w-[460px] relative z-10 border border-white/30 transition-all duration-300 ${shake ? 'shake' : ''}`}
        style={{
          borderRadius: '32px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* macOS Style Header with dots */}
        <div className="px-6 pt-5 pb-2 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
        </div>

        <div className="px-8 pt-8 pb-14">
          {/* Brand Logo Header — Using mstitle.png */}
          <div className="flex flex-col items-center mb-10 text-center">
            <img
              src={mstitle}
              alt="MayaSindhu"
              className="h-16 w-auto object-contain mb-4 drop-shadow-md"
            />
            <p className="text-[13px] text-white font-medium uppercase tracking-wider opacity-80">Welcome Back! Enter your login credentials</p>
          </div>

          {/* iOS-Style Error Message Row */}
          <div className={`overflow-hidden transition-all duration-300 ${error ? 'h-10 opacity-100 mb-4' : 'h-0 opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 text-[#FF5F57] bg-[#FF5F57]/10 py-2 rounded-xl border border-[#FF5F57]/20">
              <AlertCircle size={14} />
              <p className="text-[12px] font-bold tracking-tight uppercase">{error}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Email Address</label>
              </div>
              <div className="relative group">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[14px] text-white placeholder:text-white/30 outline-none focus:bg-black/30 focus:border-[#1BAFAF]/50 focus:ring-4 focus:ring-[#1BAFAF]/10 transition-all duration-300"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#1BAFAF] transition-colors" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-[14px] text-white placeholder:text-white/30 outline-none focus:bg-black/30 focus:border-[#1BAFAF]/50 focus:ring-4 focus:ring-[#1BAFAF]/10 transition-all duration-300"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#1BAFAF] transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors active:scale-95"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1BAFAF] text-white py-4.5 rounded-2xl flex items-center justify-center gap-3 group transition-all duration-300 hover:bg-[#17a0a0] hover:shadow-xl hover:shadow-[#1BAFAF]/20 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-[15px] font-bold tracking-tight">Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
