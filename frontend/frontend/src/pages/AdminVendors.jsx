import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiUser, FiMail, FiPhone, FiPackage, FiMapPin, FiX } from 'react-icons/fi';
import { vendorAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200', label: 'Pending' },
  accepted: { color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200',  label: 'Accepted' },
  declined: { color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200',    label: 'Declined' },
};

const AdminVendors = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await vendorAPI.getAll();
      setRequests(res.data.data);
    } catch { toast.error('Failed to load vendor requests.'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, status) => {
    setActionLoading(true);
    try {
      await vendorAPI.updateStatus(id, { status, adminNote });
      toast.success(`Request ${status}.`);
      setSelected(null);
      setAdminNote('');
      fetchRequests();
    } catch { toast.error('Failed to update request.'); }
    finally { setActionLoading(false); }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = { all: requests.length, pending: requests.filter(r => r.status === 'pending').length, accepted: requests.filter(r => r.status === 'accepted').length, declined: requests.filter(r => r.status === 'declined').length };

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="serif text-3xl text-[var(--text-dark)] mb-1">Vendor Requests</h1>
          <p className="text-[var(--text-muted)] text-sm">Review and manage bulk order agreements</p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'accepted', 'declined'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-white text-gray-400 hover:text-[var(--primary)] border border-gray-100'}`}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <FiPackage size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-black">No {filter === 'all' ? '' : filter} requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req, i) => (
              <motion.div key={req._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-5 border-white/50 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => { setSelected(req); setAdminNote(req.adminNote || ''); }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-[var(--text-dark)] text-base truncate">{req.companyName}</h3>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_CONFIG[req.status].bg} ${STATUS_CONFIG[req.status].color} ${STATUS_CONFIG[req.status].border}`}>
                        {STATUS_CONFIG[req.status].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FiUser size={11} /> {req.contactPerson}</span>
                      <span className="flex items-center gap-1"><FiMail size={11} /> {req.email}</span>
                      <span className="flex items-center gap-1"><FiPhone size={11} /> {req.phone}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Est. Monthly: <span className="font-bold text-gray-600">{req.estimatedMonthlyOrder}</span> · {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={e => { e.stopPropagation(); setSelected(req); setAdminNote(''); }}
                        className="px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs font-black border border-green-200 hover:bg-green-100 transition">
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-[var(--text-dark)] text-lg">{selected.companyName}</h2>
                  <p className="text-xs text-gray-400">Submitted by {selected.user?.name} ({selected.user?.email})</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Row icon={<FiUser />} label="Contact Person" value={selected.contactPerson} />
                <Row icon={<FiPhone />} label="Phone" value={selected.phone} />
                <Row icon={<FiMail />} label="Email" value={selected.email} />
                <Row icon={<FiPackage />} label="Product Categories" value={selected.productCategories} />
                <Row icon={<FiPackage />} label="Est. Monthly Order" value={selected.estimatedMonthlyOrder} />
                <Row icon={<FiMapPin />} label="Delivery Address" value={selected.deliveryAddress} />
                {selected.additionalNotes && <Row icon={<FiPackage />} label="Notes" value={selected.additionalNotes} />}

                {/* Admin note */}
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Admin Note (optional)</label>
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                    placeholder="Add a note for the vendor..."
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[var(--primary)]/30 outline-none transition-all text-sm resize-none" />
                </div>

                {selected.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleAction(selected._id, 'accepted')} disabled={actionLoading}
                      className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition disabled:opacity-50">
                      {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheckCircle size={15} /> Accept</>}
                    </button>
                    <button onClick={() => handleAction(selected._id, 'declined')} disabled={actionLoading}
                      className="flex-1 py-3 rounded-2xl bg-red-50 text-red-500 font-black text-sm flex items-center justify-center gap-2 border border-red-200 hover:bg-red-100 transition disabled:opacity-50">
                      <FiXCircle size={15} /> Decline
                    </button>
                  </div>
                )}

                {selected.status !== 'pending' && (
                  <div className={`rounded-2xl p-4 text-center font-black text-sm ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color} border ${STATUS_CONFIG[selected.status].border}`}>
                    This request has been {selected.status}.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row = ({ icon, label, value }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-xl bg-[var(--bg-cream)] flex items-center justify-center text-[var(--primary)] shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{label}</p>
      <p className="text-sm text-[var(--text-dark)] font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

export default AdminVendors;
