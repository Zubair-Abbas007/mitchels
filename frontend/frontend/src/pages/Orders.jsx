import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiClock, FiPackage, FiCheckCircle, FiTruck, FiArrowRight, FiArrowLeft, FiShoppingBag, FiInfo, FiX } from 'react-icons/fi';
import Footer from '../components/Footer';

const STATUS_CONFIG = {
  pending:   { color: 'bg-amber-50 text-amber-600 border-amber-200',     text: 'Pending',   icon: <FiClock size={11} />,       bar: '20%'  },
  confirmed: { color: 'bg-blue-50 text-blue-600 border-blue-200',        text: 'Confirmed', icon: <FiCheckCircle size={11} />, bar: '40%'  },
  preparing: { color: 'bg-violet-50 text-violet-600 border-violet-200',  text: 'Preparing', icon: <FiPackage size={11} />,     bar: '60%'  },
  ready:     { color: 'bg-purple-50 text-purple-600 border-purple-200',  text: 'Ready',     icon: <FiTruck size={11} />,       bar: '80%'  },
  delivered: { color: 'bg-green-50 text-green-600 border-green-200',     text: 'Delivered', icon: <FiCheckCircle size={11} />, bar: '100%' },
  cancelled: { color: 'bg-red-50 text-red-500 border-red-200',           text: 'Cancelled', icon: <FiInfo size={11} />,        bar: '0%'   },
};

const STEPS = ['Ordered', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { filterOrders(); }, [search, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filterOrders = () => {
    let f = [...orders];
    if (search) f = f.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') f = f.filter(o => o.status === statusFilter);
    setFiltered(f);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'delivered', label: 'Delivered' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
      <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-24">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors text-xs font-black uppercase tracking-widest mb-3 group">
              <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <h1 className="serif text-3xl sm:text-4xl text-[var(--text-dark)] font-black">My Orders</h1>
            <p className="text-gray-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link to="/products"
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all shadow-lg shadow-[var(--primary)]/20">
            <FiShoppingBag size={14} /> Shop More
          </Link>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-[28px] p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search by order number..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:border-[var(--primary)] text-sm text-gray-700 placeholder-gray-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-nowrap">
              {filters.map(f => (
                <button key={f.id} onClick={() => setStatusFilter(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    statusFilter === f.id ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-[28px] p-16 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingBag className="text-gray-300" size={28} />
                </div>
                <h3 className="font-black text-gray-400 text-base mb-1">No orders found</h3>
                <p className="text-gray-300 text-sm mb-6">
                  {search || statusFilter !== 'all' ? 'Try a different filter.' : "You haven't placed any orders yet."}
                </p>
                <Link to="/products" className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all">
                  Browse Menu <FiArrowRight size={12} />
                </Link>
              </motion.div>
            ) : (
              filtered.map((order, i) => {
                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <motion.div key={order._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="bg-white rounded-[40px] p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 group"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/8 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 shrink-0">
                          <FiPackage size={20} />
                        </div>
                        <div>
                          <p className="font-black text-[var(--text-dark)] text-base">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.color}`}>
                          {s.icon} {s.text}
                        </span>
                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/30 transition-all">
                          <FiArrowRight size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Items</p>
                        <p className="font-bold text-[var(--text-dark)]">{order.items?.length || 0} products</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Total</p>
                        <p className="font-black text-[var(--primary)] text-base">RS {order.totalAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Payment</p>
                        <p className="font-bold text-[var(--text-dark)] capitalize">{order.paymentMethod || 'Cash'}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {order.status !== 'cancelled' && (
                      <div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
                            style={{ width: s.bar }} />
                        </div>
                        <div className="hidden sm:flex justify-between mt-2">
                          {STEPS.map((step, idx) => {
                            const stepStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                            const active = stepStatuses.indexOf(order.status) >= idx;
                            return (
                              <span key={step} className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-[var(--primary)]' : 'text-gray-300'}`}>
                                {step}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
