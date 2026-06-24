import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { FiMail, FiLock, FiArrowLeft, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../services/api';

const EMAILJS_SERVICE  = 'service_mv6rkb5';
const EMAILJS_TEMPLATE = 'template_wll9zyj';
const EMAILJS_PUBLIC   = 'l5RxBKO4o7WNr5SFD';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (step === 2) setStep(1);
    else navigate('/login');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendResetOTP({ email });
      const { otp: generatedOtp, name } = res.data;
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        { to_name: name, to_email: email, otp: generatedOtp },
        EMAILJS_PUBLIC
      );
      toast.success('OTP sent to your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Enter the OTP.'); return; }
    if (newPassword.length < 6) { toast.error('Min 6 characters.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)] relative py-10 px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <button onClick={handleBack}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors text-xs font-black uppercase tracking-widest group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        {step === 2 ? 'Back' : 'Login'}
      </button>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md">

        <div className="glass-card rounded-[40px] p-8 border-white/50">

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[var(--primary)] text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl text-lg font-black dish-shadow">M</div>
            <h1 className="serif text-2xl text-[var(--text-dark)] mb-1">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-[var(--text-muted)] text-xs italic">
              {step === 1 ? "Enter your email to receive an OTP" : `OTP sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm"
                    placeholder="your@email.com" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Send OTP <FiArrowRight size={15} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">OTP Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm tracking-[0.5em] text-center font-bold"
                  placeholder="------" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[var(--primary)] transition">
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm"
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Reset Password <FiArrowRight size={15} /></>}
              </button>
              <button type="button" onClick={handleSendOTP}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors py-1">
                Resend OTP
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Remember it?{' '}
              <Link to="/login" className="text-[var(--primary)] font-black hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
