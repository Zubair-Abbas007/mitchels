import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiRefreshCw, FiCheckCircle, FiTruck, 
  FiClock, FiPackage, FiUser, FiCreditCard, FiEye, FiArrowRight, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [search, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.data);
      setFilteredOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load curation tokens');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await orderAPI.getStats();
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(o =>
        o.orderNumber?.toString().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus);
      toast.success(`Curation stage: ${newStatus}`);
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  const markWorkerComplete = async (id) => {
    try {
      await orderAPI.workerComplete(id);
      toast.success('Ready for service');
      fetchOrders();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', text: 'In Queue', icon: <FiClock size={10} /> },
      confirmed: { color: 'bg-blue-50 text-blue-600 border-blue-100', text: 'Confirmed', icon: <FiCheckCircle size={10} /> },
      preparing: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', text: 'Kitchen', icon: <FiPackage size={10} /> },
      ready: { color: 'bg-purple-50 text-purple-600 border-purple-100', text: 'Ready', icon: <FiTruck size={10} /> },
      delivered: { color: 'bg-green-50 text-green-600 border-green-100', text: 'Served', icon: <FiCheckCircle size={10} /> },
      cancelled: { color: 'bg-red-50 text-red-600 border-red-100', text: 'Cancelled', icon: <FiXCircle size={10} /> },
    };
    return badges[status] || { color: 'bg-gray-50 text-gray-500 border-gray-100', text: status, icon: null };
  };

  const statuses = [
    { id: 'all', label: 'All Tokens' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'In Kitchen' },
    { id: 'ready', label: 'Ready' },
    { id: 'delivered', label: 'Served' }
  ];

  if (loading && orders.length === 0) {
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
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)]">Gourmet Fulfillment Center</p>
             </div>
             <h1 className="serif text-3xl sm:text-4xl text-[var(--text-dark)] leading-tight">Order Management</h1>
             <p className="text-[var(--text-muted)] mt-1 text-sm">Manage and track all customer orders.</p>
          </motion.div>
          
          <button
            onClick={fetchOrders}
            className="bg-white text-[10px] uppercase font-black tracking-widest px-8 py-4 rounded-full border border-gray-100 shadow-sm hover:shadow-lg transition flex items-center gap-2 group active:scale-95"
          >
            <FiRefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Update Pulse
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <FiPackage size={18} />, bg: 'bg-white border border-gray-100', text: 'text-[var(--primary)]', label: 'Total Orders',   value: stats.totalOrders },
              { icon: <FiClock size={18} />,   bg: 'bg-yellow-50',           text: 'text-yellow-600',       label: 'Pending',        value: stats.pendingOrders },
              { icon: <FiActivity size={18} />,bg: 'bg-indigo-50',           text: 'text-indigo-600',       label: 'In Kitchen',     value: stats.preparingOrders || 0 },
              { icon: <FiCreditCard size={18} />,bg:'bg-green-50',           text: 'text-green-600',        label: 'Revenue',        value: `RS ${stats.totalRevenue?.toLocaleString()}` },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`${s.bg} rounded-[40px] p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 ${s.text}`}>{s.icon}</div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{s.label}</p>
                  <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-[32px] p-6 mb-10 border-white/50 shadow-inner">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                placeholder="Search by order number (e.g. 0001), customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-medium italic text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {statuses.map(status => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    statusFilter === status.id
                      ? 'bg-[var(--primary)] text-white shadow-lg'
                      : 'bg-white text-gray-400 hover:text-[var(--primary)]'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-card rounded-[40px] overflow-hidden border-white/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Token ID</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Client</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden md:table-cell">Timestamp</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stage</th>
                  <th className="px-4 sm:px-10 py-4 sm:py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredOrders.map((order, index) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order._id} className="hover:bg-white transition group">
                      <td className="px-4 sm:px-10 py-4 sm:py-8 font-black text-sm text-[var(--text-dark)]">#{order.orderNumber}</td>
                      <td className="px-4 sm:px-10 py-4 sm:py-8 hidden sm:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 font-black italic shadow-inner shrink-0">
                             { (order.user?.name || order.customerName || 'G')[0] }
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--text-dark)]">{order.user?.name || order.customerName}</p>
                            <p className="text-[10px] text-gray-300 font-bold italic hidden md:block">{order.customerEmail || 'Guest'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-10 py-4 sm:py-8 text-sm text-gray-400 font-medium italic hidden md:table-cell">
                         {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 sm:px-10 py-4 sm:py-8 font-black text-[var(--primary)] text-sm sm:text-lg">
                        RS {order.totalAmount?.toLocaleString()}
                        {order.couponCode && (
                          <span className="block text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                            🎟 {order.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-10 py-4 sm:py-8">
                        <span className={`inline-flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.icon}
                          <span className="hidden sm:inline">{status.text}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-10 py-4 sm:py-8">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                            title="Examine Details"
                          >
                            <FiEye size={18} />
                          </button>
                          
                          {/* Sequential Controls */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(order._id, 'confirmed')}
                              className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-green-600 hover:bg-green-50"
                              title="Initialize Fulfillment"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(order._id, 'preparing')}
                              className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-50"
                              title="Send to Kitchen"
                            >
                              <FiPackage size={18} />
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => markWorkerComplete(order._id)}
                              className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-purple-600 hover:bg-purple-50"
                              title="Mark Ready for Service"
                            >
                              <FiTruck size={18} />
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateStatus(order._id, 'delivered')}
                              className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-green-600 hover:bg-green-50"
                              title="Finalize Service"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-gray-300 italic text-sm">
                      No matching tokens found in the archive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FiXCircle = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default AdminOrders;