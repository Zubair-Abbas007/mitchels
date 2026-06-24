import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiArrowRight, FiPlus, FiMinus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { vendorAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { icon: <FiClock size={15} />,        color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200', label: 'Pending Review' },
  accepted: { icon: <FiCheckCircle size={15} />,  color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200',  label: 'Accepted' },
  declined: { icon: <FiXCircle size={15} />,      color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200',    label: 'Declined' },
};

const BulkOrder = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', phone: '', email: user?.email || '',
    productCategories: '', estimatedMonthlyOrder: '', deliveryAddress: '', additionalNotes: ''
  });

  useEffect(() => {
    fetchMyRequests();
    fetchProducts();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await vendorAPI.getMy();
      const data = res.data.data || [];
      setMyRequests(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch {}
    finally { setLoadingRequests(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data || []);
    } catch {}
  };

  const addItem = (product) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.product._id === product._id);
      if (exists) return prev.map(i => i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { setSelectedItems(prev => prev.filter(i => i.product._id !== id)); return; }
    setSelectedItems(prev => prev.map(i => i.product._id === id ? { ...i, qty } : i));
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['companyName', 'contactPerson', 'phone', 'email', 'productCategories', 'estimatedMonthlyOrder', 'deliveryAddress'];
    for (const key of required) {
      if (!form[key].trim()) { toast.error('Please fill all required fields.'); return; }
    }
    setLoading(true);
    try {
      const itemsSummary = selectedItems.length > 0
        ? '\n\nRequested Items:\n' + selectedItems.map(i => `- ${i.product.name} x${i.qty} (RS ${i.product.price * i.qty})`).join('\n')
        : '';
      await vendorAPI.submit({ ...form, additionalNotes: form.additionalNotes + itemsSummary });
      toast.success('Bulk order request submitted!');
      setShowForm(false);
      setForm({ companyName: '', contactPerson: '', phone: '', email: user?.email || '', productCategories: '', estimatedMonthlyOrder: '', deliveryAddress: '', additionalNotes: '' });
      setSelectedItems([]);
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequests) {
    return (
      <div className="min-h-screen bg-[var(--bg-cream)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-24 sm:pt-32 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <FiPackage size={28} />
          </div>
          <h1 className="serif text-4xl text-[var(--text-dark)] mb-2">Bulk / Vendor Orders</h1>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
            Manage your bulk order requests and submit new ones below.
          </p>
        </motion.div>

        {/* New Request Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-sm shadow-lg hover:bg-[var(--primary-dark)] transition-all">
            <span className="flex items-center gap-2"><FiPlus size={16} /> Submit New Request</span>
            {showForm ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
        </motion.div>

        {/* New Request Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8">
              <div className="glass-card rounded-[32px] p-6 border-white/50">
                <h2 className="font-black text-[var(--text-dark)] text-lg mb-5">Request Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Company / Business Name *" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Mitchells Distributors" />
                    <Field label="Contact Person *" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number *" name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 0000000" />
                    <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
                  </div>
                  <Field label="Product Categories Needed *" name="productCategories" value={form.productCategories} onChange={handleChange} placeholder="e.g. Jams, Sauces, Pickles" />
                  <Field label="Estimated Monthly Order Value *" name="estimatedMonthlyOrder" value={form.estimatedMonthlyOrder} onChange={handleChange} placeholder="e.g. RS 50,000 - 100,000" />
                  <Field label="Delivery Address *" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} placeholder="Full delivery address" />
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Additional Notes</label>
                    <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} rows={3}
                      placeholder="Any special requirements..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm resize-none" />
                  </div>

                  {/* Product Picker */}
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">Add Products (Optional)</label>
                    {selectedItems.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {selectedItems.map(({ product, qty }) => (
                          <div key={product._id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 border-2 border-gray-50">
                            <img src={product.image} alt={product.name} className="w-8 h-8 rounded-full object-cover shrink-0"
                              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                            <span className="flex-1 text-sm font-bold text-[var(--text-dark)] truncate">{product.name}</span>
                            <span className="text-xs text-gray-400 shrink-0">RS {product.price}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button type="button" onClick={() => updateQty(product._id, qty - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><FiMinus size={11} /></button>
                              <span className="w-6 text-center text-sm font-black">{qty}</span>
                              <button type="button" onClick={() => updateQty(product._id, qty + 1)} className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-dark)] transition"><FiPlus size={11} /></button>
                              <button type="button" onClick={() => updateQty(product._id, 0)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition ml-1"><FiTrash2 size={11} /></button>
                            </div>
                          </div>
                        ))}
                        <div className="text-right text-xs font-black text-[var(--primary)] pr-1">
                          Total: RS {selectedItems.reduce((s, i) => s + i.product.price * i.qty, 0).toLocaleString()}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {products.map(p => (
                        <button key={p._id} type="button" onClick={() => addItem(p)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all text-left">
                          <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[var(--text-dark)] truncate">{p.name}</p>
                            <p className="text-[10px] text-gray-400">RS {p.price}</p>
                          </div>
                          <FiPlus size={13} className="text-[var(--primary)] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg">
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Submit <FiArrowRight size={15} /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Requests History */}
        {myRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-black text-[var(--text-dark)] text-base uppercase tracking-widest text-[10px] text-gray-400">Your Requests</h2>
            {myRequests.map((req, i) => (
              <motion.div key={req._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`rounded-2xl border p-5 ${STATUS_CONFIG[req.status].bg} ${STATUS_CONFIG[req.status].border}`}>

                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 mb-1 ${STATUS_CONFIG[req.status].color}`}>
                      {STATUS_CONFIG[req.status].icon}
                      <span className="font-black text-xs uppercase tracking-widest">{STATUS_CONFIG[req.status].label}</span>
                    </div>
                    <p className="font-black text-[var(--text-dark)] text-sm truncate">{req.companyName}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{new Date(req.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white/60 text-xs font-black text-gray-600 hover:bg-white transition-all flex items-center gap-1">
                    {expandedId === req._id ? <><FiChevronUp size={12} /> Hide</> : <><FiChevronDown size={12} /> Details</>}
                  </button>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedId === req._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-current/10 space-y-2 text-sm text-gray-700">
                        <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Contact:</span> {req.contactPerson} · {req.phone}</p>
                        <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Email:</span> {req.email}</p>
                        <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Categories:</span> {req.productCategories}</p>
                        <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Est. Monthly:</span> {req.estimatedMonthlyOrder}</p>
                        <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Address:</span> {req.deliveryAddress}</p>
                        {req.additionalNotes && (
                          <p><span className="font-black text-xs uppercase tracking-widest text-gray-400">Notes:</span> {req.additionalNotes}</p>
                        )}
                        {req.adminNote && (
                          <div className="mt-2 p-3 bg-white rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Admin Note:</p>
                            <p className="text-sm text-gray-700">{req.adminNote}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {myRequests.length === 0 && !showForm && (
          <div className="text-center py-16 text-gray-400">
            <FiPackage size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-black text-sm">No requests yet</p>
            <p className="text-xs mt-1">Click "Submit New Request" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-50 focus:border-[var(--primary)]/30 outline-none transition-all text-sm" />
  </div>
);

export default BulkOrder;
