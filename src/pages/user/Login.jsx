import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full bg-[#FDFBF7] flex flex-col items-center justify-between p-4 md:p-8 font-sans relative">
      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-all group z-20">
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back
      </button>
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-xl shadow-black/5 border border-white/50 p-8 md:p-10 relative z-10 flex flex-col">

          <div className="text-center mb-8">
            <Link to="/" className="inline-block hover:scale-105 transition-transform mb-6">
              <h1 className="text-4xl font-fashion text-text-main tracking-widest">
                MAYA<span className="text-brand-orange">SINDHU</span>
              </h1>
            </Link>

            <h2 className="text-[22px] font-semibold text-text-main mb-1 tracking-tight">
              {isLogin ? "Login" : "Create account"}
            </h2>
            <p className="text-[13px] text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-brand-orange font-medium hover:underline transition-all">
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">

            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent border border-gray-300 rounded-md py-3.5 px-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-gray-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent border border-gray-300 rounded-md py-3.5 px-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-gray-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border border-gray-300 rounded-md py-3.5 px-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-gray-400"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-all p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 text-[13px] font-medium bg-red-50 p-3 rounded-md"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3.5 rounded-md font-semibold text-[14px] hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Continue"}
            </button>


          </form>
        </div>
      </div>

      <div className="w-full text-center py-6">
        <Link to="#" className="text-gray-500 text-[13px] hover:text-black hover:underline transition-all">
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
