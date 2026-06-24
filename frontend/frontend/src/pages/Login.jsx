import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const next = {};
    const email = formData.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    const password = formData.password;
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    return next;
  }, [formData.email, formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length) { toast.error('Please review the highlighted fields.'); return; }
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(result.user.role === 'admin' ? '/dashboard' : '/products');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-[var(--bg-cream)] relative">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      {/* Back button — top left */}
      <button onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors text-xs font-black uppercase tracking-widest group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md px-4">
        <div className="glass-card rounded-[40px] p-8 md:p-10 border-white/50">

          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl text-xl font-black dish-shadow">M</div>
            <h1 className="serif text-3xl text-[var(--text-dark)] mb-1">Welcome Back</h1>
            <p className="text-[var(--text-muted)] text-sm italic">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white border-2 outline-none transition-all text-sm ${touched.email && errors.email ? 'border-red-200' : 'border-gray-50 focus:border-[var(--primary)]/30'}`}
                  placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 outline-none transition-all text-sm ${touched.password && errors.password ? 'border-red-200' : 'border-gray-50 focus:border-[var(--primary)]/30'}`}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[var(--primary)] transition">
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <FiArrowRight /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              New here?{' '}
              <Link to="/signup" className="text-[var(--primary)] font-black hover:underline">Join Us</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
