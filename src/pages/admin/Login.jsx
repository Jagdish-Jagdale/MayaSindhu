import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('AUTHENTICATION FAILED. PLEASE VERIFY CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fefccf] relative overflow-hidden font-sans selection:bg-[#600000] selection:text-[#fefccf]">
      {/* Editorial Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f2f0c4]/30 pointer-events-none"></div>
      <div className="absolute top-[20%] left-[10%] w-[1px] h-[60%] bg-[#600000]/10 hidden md:block"></div>
      
      <div className="w-full max-w-[480px] p-6 relative z-10">
        <div className="bg-white/40 backdrop-blur-md rounded-0 shadow-[0_20px_50px_rgba(57,0,0,0.05)] border border-[#600000]/5 p-12 md:p-16">
          <div className="mb-12">
            <h2 className="text-[#600000] text-[10px] tracking-[0.3em] font-bold uppercase mb-4">
              Internal Access
            </h2>
            <h1 className="text-4xl md:text-5xl font-serif text-[#390000] leading-tight mb-4 tracking-tight">
              Admin <br />
              <span className="italic">Portal</span>
            </h1>
            <div className="w-12 h-[2px] bg-[#D4AF37]"></div>
          </div>

          {error && (
            <div className="bg-[#600000] text-[#fefccf] px-4 py-3 rounded-0 mb-8 flex items-center gap-3 animate-slide-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-[11px] font-bold tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-[#600000]/60 uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#600000]/20 focus:border-[#D4AF37] py-3 outline-none transition-all duration-500 text-[#390000] placeholder:text-[#390000]/20 font-medium"
                  placeholder="admin@mayasindhu.com"
                />
                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#600000]/20 group-focus-within:text-[#D4AF37] transition-colors" />
              </div>
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-[#600000]/60 uppercase tracking-[0.2em]">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-[#600000]/20 focus:border-[#D4AF37] py-3 outline-none transition-all duration-500 text-[#390000] placeholder:text-[#390000]/20 font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#600000]/20 group-focus-within:text-[#D4AF37] transition-colors" />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#600000] text-white py-5 px-8 rounded-0 flex items-center justify-between group transition-all duration-500 hover:bg-[#390000] disabled:opacity-50"
              >
                <span className="text-[12px] font-bold tracking-[0.3em] uppercase ml-2">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </span>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500 mr-2" />
                )}
              </button>
            </div>
          </form>

          <div className="mt-16 flex items-center justify-between border-t border-[#600000]/5 pt-8">
            <p className="text-[9px] text-[#600000]/40 font-bold uppercase tracking-[0.2em]">
              MayaSindhu Boutique &copy; 2026
            </p>
            <div className="flex gap-4">
              <div className="w-1 h-1 bg-[#D4AF37]/40"></div>
              <div className="w-1 h-1 bg-[#D4AF37]/40"></div>
              <div className="w-1 h-1 bg-[#D4AF37]/40"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;

