import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login Submission Error:", err);
      const errorCode = err.code;
      
      let message = 'An unexpected error occurred. Please try again.';
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-login-credentials' || errorCode === 'auth/wrong-password') {
        message = 'Invalid email or password. Please double check your credentials.';
      } else if (errorCode === 'auth/user-not-found') {
        message = 'No account found with this email. Please sign up first.';
      } else if (errorCode === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try logging in instead.';
      } else if (errorCode === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled. Please enable it in the Firebase Console.';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Your account has been temporarily disabled.';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-6 pt-32 pb-20">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6B00]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#004D4D]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Image & Branding */}
        <div className="w-full md:w-1/2 bg-[#004D4D] p-12 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80" 
              alt="Handloom Detail" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-12">
              <h1 className="text-3xl font-fashion font-bold tracking-tighter">
                Maya<span className="text-[#D4AF37]">Sindhu</span>
              </h1>
            </Link>
            <h2 className="text-4xl md:text-5xl font-fashion font-bold leading-tight mb-6">
              {isLogin ? "Welcome Back to Heritage." : "Join our Artisan Community."}
            </h2>
            <p className="text-white/70 text-lg max-w-sm leading-relaxed">
              Step into a world where every thread weave a story of craftsmanship and tradition.
            </p>
          </div>

          <div className="relative z-10 pt-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-[#D4AF37]" />
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37]">Est. 1994</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-12 md:p-20 bg-white">
          <div className="mb-12">
            <div className="flex gap-8 mb-8">
              <button 
                onClick={() => setIsLogin(true)}
                className={`text-sm font-bold uppercase tracking-[0.2em] pb-2 transition-all border-b-2 ${isLogin ? 'border-[#FF6B00] text-[#1A1A1A]' : 'border-transparent text-gray-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`text-sm font-bold uppercase tracking-[0.2em] pb-2 transition-all border-b-2 ${!isLogin ? 'border-[#FF6B00] text-[#1A1A1A]' : 'border-transparent text-gray-300'}`}
              >
                Signup
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              {isLogin ? "Please enter your details to access your boutique account." : "Create an account to save your favorite handcrafted treasures."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full bg-[#FAF9F6] border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full bg-[#FAF9F6] border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Password</label>
                {isLogin && <button type="button" className="text-[10px] font-bold text-[#FF6B00] hover:underline uppercase tracking-widest">Forgot?</button>}
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F6] border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-4 rounded-xl"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B00] text-white py-5 rounded-2xl font-bold uppercase text-[12px] tracking-[0.2em] shadow-xl shadow-[#FF6B00]/20 hover:bg-[#E66000] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In to Account' : 'Create My Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
             <p className="text-gray-400 text-xs">
                By continuing, you agree to MayaSindhu's <span className="text-[#1A1A1A] underline cursor-pointer">Terms of Service</span> and <span className="text-[#1A1A1A] underline cursor-pointer">Privacy Policy</span>.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
