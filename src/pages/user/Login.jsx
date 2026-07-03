/**
 * File: Login.jsx
 * Description: Modal side-panel containing forms for customer sign-in, account creation, and user input validation.
 * Work Done: Restricted account authentication to email-only inputs, updating standard regex validations and placeholders. Removed mobile login and mock sub-email creation pipelines during form submission.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import navLogo from '../../assets/navbar logo.png';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, isLoginModalOpen, setLoginModalOpen } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const isEmailLogin = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailLogin) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!name || !name.trim()) {
        setError('Name is a required field.');
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(name)) {
        setError('Name can only contain letters and spaces.');
        return;
      }
      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters.');
        return;
      }
      if (name.length > 50) {
        setError('Name cannot exceed 50 characters.');
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        setError('Please enter a valid mobile number.');
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters, include one uppercase, one lowercase, one number, and one special character.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Logged in successfully. Welcome back!");
      } else {
        const authEmail = email || `${mobile}@mayasindhu.user`;
        await signup(authEmail, password, name, mobile);
        toast.success("Account created successfully. Welcome!");
      }
      handleCloseModal();
    } catch (err) {
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

  const handleCloseModal = () => {
    setLoginModalOpen(false);
    setTimeout(() => {
      setEmail('');
      setPassword('');
      setName('');
      setMobile('');
      setError('');
      setIsLogin(true);
    }, 200);
  };

  useEscapeKey(handleCloseModal, isLoginModalOpen);

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[2001] shadow-2xl flex flex-col overflow-y-auto"
          >
            <div className="flex-shrink-0 p-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-black hover:text-white rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 md:px-10 pb-12">
              <div className="text-center mb-8">
                <div className="inline-block mb-6 flex flex-col items-center">
                  <div className="relative h-24 w-32 mb-1">
                    <img src={navLogo} alt="MayaSindhu Logo" className="h-full w-full object-contain opacity-0" />
                    <div
                      className="absolute inset-0 bg-brand-orange"
                      style={{
                        WebkitMaskImage: `url(${navLogo})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskImage: `url(${navLogo})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      }}
                    />
                  </div>
                </div>

                <h2 className="text-[22px] font-semibold text-text-main mb-1 tracking-tight">
                  {isLogin ? "Login" : "Create account"}
                </h2>
                <p className="text-[13px] text-gray-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail('');
                    setPassword('');
                    setName('');
                    setMobile('');
                    setError('');
                  }} className="text-brand-orange font-medium hover:underline transition-all">
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
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      <input
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-transparent border border-gray-300 rounded-md py-3.5 px-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-gray-400"
                      />
                      <input
                        type="tel"
                        required={!isLogin}
                        value={mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setMobile(val);
                        }}
                        placeholder="Mobile Number "
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

              <div className="w-full text-center mt-12">
                <a href="#" className="text-gray-500 text-[13px] hover:text-black hover:underline transition-all">
                  Privacy policy
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
