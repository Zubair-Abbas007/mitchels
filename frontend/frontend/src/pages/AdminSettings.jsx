import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await userAPI.updateProfile({ name: profileForm.name, email: profileForm.email });
      toast.success('Profile updated. Please log in again.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match.'); return; }
    setPasswordLoading(true);
    try {
      await userAPI.updateProfile({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-black text-gray-800 text-xl mb-1">Settings</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Manage your admin account</p>
      </motion.div>

      {/* Profile Info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">Profile Information</p>
            <p className="text-[10px] text-gray-400">Update your name and email</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[var(--primary)] text-sm transition-all"
                placeholder="Admin Name" required />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[var(--primary)] text-sm transition-all"
                placeholder="admin@email.com" required />
            </div>
          </div>
          <button type="submit" disabled={profileLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition disabled:opacity-50">
            {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave size={13} /> Save Changes</>}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FiLock size={16} />
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">Change Password</p>
            <p className="text-[10px] text-gray-400">Keep your account secure</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type={showCurrent ? 'text' : 'password'} value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[var(--primary)] text-sm transition-all"
                placeholder="••••••••" required />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition">
                {showCurrent ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type={showNew ? 'text' : 'password'} value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[var(--primary)] text-sm transition-all"
                placeholder="Min 6 characters" required />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition">
                {showNew ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[var(--primary)] text-sm transition-all"
                placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={passwordLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition disabled:opacity-50">
            {passwordLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiShield size={13} /> Update Password</>}
          </button>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">Account Info</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-black text-[var(--primary)] uppercase text-xs">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Current Email</span>
            <span className="font-bold text-gray-700">{user?.email}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
