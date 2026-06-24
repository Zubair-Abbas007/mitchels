import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiEdit2, FiTrash2, FiUser, FiMail, 
  FiShield, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiCalendar, FiUsers, FiX, FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data);
      setFilteredUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (search) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  };

  const updateUserRole = async (id, role) => {
    try {
      await userAPI.update(id, { role });
      toast.success(`Access level set to ${role}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update access');
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await userAPI.update(id, { status: newStatus });
      toast.success(`Identity ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await userAPI.update(editingUser._id, {
        name: editFormData.name,
        role: editFormData.role,
        status: editFormData.status
      });
      toast.success('Identity Refined');
      closeEditModal();
      fetchUsers();
    } catch (error) {
      toast.error('Refinement failed');
    }
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`Permanently remove identifier "${name}" from the Mitchells collection?`)) {
      try {
        await userAPI.delete(id);
        toast.success('Identity Removed');
        fetchUsers();
      } catch (error) {
        toast.error('Removal failed');
      }
    }
  };

  // Stats calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-cream)] pb-6 font-inter">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
             <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[2px] bg-[var(--primary)]"></span>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)]">Mitchells Community Hub</p>
             </div>
             <h1 className="serif text-3xl sm:text-5xl text-[var(--text-dark)] leading-tight">Member Directory</h1>
             <p className="text-[var(--text-muted)] mt-2 italic shadow-inner bg-white/30 px-3 py-1 rounded-lg inline-block">Managing the gourmet collective identity.</p>
          </motion.div>
          
          <button
            onClick={fetchUsers}
            className="bg-white text-[10px] uppercase font-black tracking-widest px-8 py-4 rounded-full border border-gray-100 shadow-sm hover:shadow-lg transition flex items-center gap-2 group active:scale-95"
          >
            <FiRefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Directory
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-[32px] p-8 border-white/50 group">
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/5 flex items-center justify-center text-[var(--primary)]">
                  <FiUsers size={24} />
               </div>
             </div>
             <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Active community</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">{totalUsers} Members</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-[32px] p-8 border-white/50 group">
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                  <FiCheckCircle size={24} />
               </div>
             </div>
             <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Authenticated</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">{activeUsers} Verified</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-[32px] p-8 border-white/50 group">
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <FiShield size={24} />
               </div>
             </div>
             <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Administrative</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">{adminUsers} Controllers</h3>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="glass-card rounded-[32px] p-6 mb-10 border-white/50 shadow-inner">
          <div className="relative">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="text"
              placeholder="Exposé by Name or Digital Identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-medium italic text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[40px] overflow-hidden border-white/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden md:table-cell">Email</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Role</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden lg:table-cell">Joined</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-white transition group">
                    <td className="px-4 sm:px-10 py-4 sm:py-8">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white shadow-inner flex items-center justify-center text-[var(--primary)] font-black text-lg border border-gray-50 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 shrink-0">
                             {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--text-dark)]">{user.name}</p>
                            {user.role === 'admin' && (
                              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mt-0.5 hidden sm:block">Admin</p>
                            )}
                          </div>
                       </div>
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-8 hidden md:table-cell">
                       <div className="flex items-center gap-2 text-gray-400 font-medium italic text-sm">
                          <FiMail size={14} />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                       </div>
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-8 hidden sm:table-cell">
                       <select
                         value={user.role}
                         onChange={(e) => updateUserRole(user._id, e.target.value)}
                         className="px-3 py-2 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest outline-none bg-white"
                       >
                         <option value="user">User</option>
                         <option value="admin">Admin</option>
                       </select>
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-8">
                       <button
                         onClick={() => toggleUserStatus(user._id, user.status)}
                         className={`px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${
                           user.status === 'active'
                             ? 'bg-green-50 text-green-600 border-green-100'
                             : 'bg-red-50 text-red-600 border-red-100'
                         }`}
                       >
                         {user.status === 'active' ? '✓ Active' : '✗ Off'}
                       </button>
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-8 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-gray-400 font-medium italic text-sm">
                           <FiCalendar size={14} />
                           {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-8">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => openEditModal(user)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 shadow-sm">
                            <FiEdit2 size={15} />
                          </button>
                          {user.email !== 'admin@food.com' && (
                            <button onClick={() => deleteUser(user._id, user.name)}
                              className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm">
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-gray-300 italic text-sm">
                      No matching identities found in the Mitchells directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Edit Identity Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-cream)] rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden border border-white/50"
            >
              <div className="bg-[var(--primary)] p-8 flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 -translate-y-16"></div>
                 <h2 className="serif text-2xl text-white relative z-10 flex items-center gap-3">
                   <FiEdit2 /> Refine Identity
                 </h2>
                 <button onClick={closeEditModal} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all relative z-10">
                   <FiX size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Identity Signature</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-bold text-sm"
                    required
                  />
                </div>
                
                <div className="space-y-4 opacity-70">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Static Link (Permanent)</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    disabled
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 border-2 border-gray-50 text-gray-400 font-medium text-sm italic cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Governance</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest outline-none bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Stage</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest outline-none bg-white"
                    >
                      <option value="active">Operational</option>
                      <option value="inactive">Suspended</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20"
                  >
                    Commit <FiArrowRight className="inline ml-1" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminUsers;