import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { authAPI } from '../services/api';

const EMAILJS_SERVICE  = 'service_mv6rkb5';
const EMAILJS_TEMPLATE = 'template_wll9zyj';
const EMAILJS_PUBLIC   = 'l5RxBKO4o7WNr5SFD';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: form, 2: otp
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const navigate = useNavigate();
  const { register } = useAuth();

  const errors = useMemo(() => {
    const next = {};
    const name = formData.name.trim();
    if (!name) next.name = 'Required.';
    else if (name.length < 2) next.name = 'Too short.';
    const email = formData.email.trim();
    if (!email) next.email = 'Required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Invalid email.';
    const password = formData.password;
    if (!password) next.password = 'Required.';
    else if (password.length < 6) next.password = 'Min 6 characters.';
    const confirm = formData.confirmPassword;
    if (!confirm) next.confirmPassword = 'Required.';
    else if (password && confirm !== password) next.confirmPassword = 'Passwords do not match.';
    return next;
  }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

  // Step 1: validate form, send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errors).length) { toast.error('Please fix the errors.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.sendOTP({ email: formData.email.trim() });
      const { otp: generatedOtp } = res.data;

      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          to_name: formData.name.trim(),
          to_email: formData.email.trim(),
          otp: `Your Mitchells verification code is: ${generatedOtp} (valid 10 minutes)`
        },
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

  // Step 2: verify OTP then register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Enter the OTP.'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email: formData.email.trim(), otp });
      const result = await register(formData.name.trim(), formData.email.trim(), formData.password);
      if (result.success) {
        toast.success(`Welcome, ${formData.name}!`);
        navigate('/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const field = (type, name, label, icon, show, setShow) => (
    <div>
      <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
        <input
          type={show !== undefined ? (show ? 'text' : type) : type}
          name={name}
          value={formData[name]}
          onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
          className={`w-full pl-12 pr-${setShow ? '12' : '5'} py-3.5 rounded-2xl bg-white border-2 outline-none transition-all text-sm ${touched[name] && errors[name] ? 'border-red-200' : 'border-gray-50 focus:border-[var(--primary)]/30'}`}
          placeholder={type === 'password' ? '••••••••' : ''}
        />
        {setShow && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[var(--primary)] transition">
            {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        )}
      </div>
      {touched[name] && errors[name] && (
        <p className="text-red-400 text-[10px] mt-1 ml-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)] relative py-10 px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <button onClick={() => step === 2 ? setStep(1) : navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors text-xs font-black uppercase tracking-widest group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        {step === 2 ? 'Back' : 'Home'}
      </button>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md">
        <div className="glass-card rounded-[40px] p-8 md:p-10 border-white/50">

          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl text-xl font-black dish-shadow">M</div>
            <h1 className="serif text-3xl text-[var(--text-dark)] mb-1">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm italic">
              {step === 1 ? 'Join the Mitchells experience' : `OTP sent to ${formData.email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {field('text', 'name', 'Full Name', <FiUser size={16} />, undefined, undefined)}
              {field('email', 'email', 'Email', <FiMail size={16} />, undefined, undefined)}
              {field('password', 'password', 'Password', <FiLock size={16} />, showPassword, setShowPassword)}
              {field('password', 'confirmPassword', 'Confirm Password', <FiLock size={16} />, showConfirmPassword, setShowConfirmPassword)}

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg mt-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Continue <FiArrowRight /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 ml-1">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm tracking-[0.5em] text-center font-bold"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Verify & Sign Up <FiArrowRight /></>}
              </button>

              <button type="button" onClick={handleSendOTP} disabled={loading}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                Resend OTP
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--primary)] font-black hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
