import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  FiShoppingBag, FiClock, FiCheckCircle, FiTruck,
  FiPackage, FiCreditCard, FiArrowRight, FiActivity,
  FiUsers, FiGrid, FiList, FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, YAxis, Legend } from 'recharts';
import Footer from '../components/Footer';
import AdminOrdersPage from './AdminOrders';
import AdminProductsPage from './AdminProducts';
import AdminUsersPage from './Adminuser';
import AdminVendorsPage from './AdminVendors';
import AdminSettingsPage from './AdminSettings';

/* ── Build chart from real orders ── */
const buildChart = (orders, mode) => {
  if (mode === 'weekly') {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if ((now - d) / 86400000 < 7) counts[d.getDay()]++;
    });
    return days.map((name, i) => ({ name, orders: counts[i] }));
  }
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ name: d.toLocaleString('default', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), orders: 0 });
  }
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
    if (m) m.orders++;
  });
  return months;
};

/* ── Admin Sidebar ── */
const Sidebar = ({ active, setActive, onLogout }) => {
  const [open, setOpen] = useState(false);
  const links = [
    { id: 'overview',  icon: <FiGrid size={18} />,     label: 'Overview' },
    { id: 'orders',    icon: <FiList size={18} />,      label: 'Orders' },
    { id: 'products',  icon: <FiPackage size={18} />,   label: 'Products' },
    { id: 'users',     icon: <FiUsers size={18} />,     label: 'Users' },
    { id: 'vendors',   icon: <FiActivity size={18} />,  label: 'Vendors' },
    { id: 'settings',  icon: <FiSettings size={18} />,  label: 'Settings' },
  ];
  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="fixed top-24 left-4 z-40 lg:hidden w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 border border-gray-100">
        {open ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>

      <aside className={`fixed top-0 left-0 h-full z-30 bg-white border-r border-gray-100 shadow-xl transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none`}
        style={{ width: '220px' }}>

        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <p className="font-black text-[#1a2a8f] text-base tracking-tight">MITCHELL'S</p>
          <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(l => (
            <button key={l.id} onClick={() => { setActive(l.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                active === l.id ? 'bg-[var(--primary)] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}>
              {l.icon} {l.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('weekly');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderAPI.getAll(),
        isAdmin ? orderAPI.getStats() : Promise.resolve({ data: null })
      ]);
      const orders = ordersRes.data.data || [];
      setAllOrders(orders);
      setRecentOrders(orders.slice(0, 8));
      if (isAdmin && statsRes.data) {
        setStats(statsRes.data.data);
      } else {
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: orders.filter(o => o.status === 'delivered').length,
          totalRevenue: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const chartData = buildChart(allOrders, chartMode);

  const getStatusBadge = (status) => ({
    pending:   { color: 'bg-amber-50 text-amber-600',   text: 'Pending'   },
    confirmed: { color: 'bg-blue-50 text-blue-600',     text: 'Confirmed' },
    preparing: { color: 'bg-violet-50 text-violet-600', text: 'Preparing' },
    ready:     { color: 'bg-purple-50 text-purple-600', text: 'Ready'     },
    delivered: { color: 'bg-green-50 text-green-600',   text: 'Delivered' },
    cancelled: { color: 'bg-red-50 text-red-500',       text: 'Cancelled' },
  }[status] || { color: 'bg-gray-50 text-gray-500', text: status });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── Non-admin: simple user dashboard ── */
  if (!isAdmin) {
    const statCards = [
      { label: 'My Orders',    value: stats?.totalOrders || 0,                                    icon: <FiShoppingBag size={18} />, bg: 'bg-blue-50',   text: 'text-blue-600'   },
      { label: 'Pending',      value: stats?.pendingOrders || 0,                                  icon: <FiClock size={18} />,       bg: 'bg-amber-50',  text: 'text-amber-600'  },
      { label: 'Delivered',    value: stats?.completedOrders || 0,                                icon: <FiCheckCircle size={18} />, bg: 'bg-green-50',  text: 'text-green-600'  },
      { label: 'Total Spent',  value: `RS ${(stats?.totalRevenue || 0).toLocaleString()}`,        icon: <FiCreditCard size={18} />,  bg: 'bg-red-50',    text: 'text-red-500'    },
    ];
    return (
      <div className="min-h-screen bg-[var(--bg-cream)] pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)] mb-1">My Dashboard</p>
            <h1 className="serif text-3xl sm:text-4xl text-[var(--text-dark)]">Hello, {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Here's your activity overview.</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 truncate">{s.label}</p>
                  <p className="text-xl font-black text-[var(--text-dark)] leading-tight">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[var(--text-dark)] text-base flex items-center gap-2"><FiActivity size={16} className="text-[var(--primary)]" /> Order Activity</h3>
                <div className="flex gap-1.5">
                  {['weekly','monthly'].map(m => (
                    <button key={m} onClick={() => setChartMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartMode === m ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={v => [`${v} orders`]} />
                    <Area type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={3} fill="url(#g1)" dot={{ fill: 'var(--primary)', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-[var(--primary)] rounded-2xl p-6 text-white flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-8 -translate-y-8" />
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Browse</p>
                <h3 className="font-black text-lg mb-4">Explore our menu</h3>
                <Link to="/products" className="inline-flex items-center gap-2 bg-white text-[var(--primary)] px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest">Menu <FiArrowRight size={13} /></Link>
              </div>
              <div className="bg-[var(--accent)] rounded-2xl p-6 text-white flex-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-8 translate-y-8" />
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Track</p>
                <h3 className="font-black text-lg mb-4">View your orders</h3>
                <Link to="/orders" className="inline-flex items-center gap-2 bg-white text-[var(--accent)] px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest">Orders <FiArrowRight size={13} /></Link>
              </div>
            </motion.div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-[var(--text-dark)] text-base">Recent Orders</h3>
              <Link to="/orders" className="text-[var(--primary)] text-xs font-black uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Order</th><th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell">Date</th><th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th><th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(o => { const s = getStatusBadge(o.status); return (
                    <tr key={o._id} onClick={() => navigate(`/orders/${o._id}`)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-5 py-4 font-black text-sm text-[var(--text-dark)]">#{o.orderNumber}</td>
                      <td className="px-5 py-4 text-sm text-gray-400 hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</td>
                      <td className="px-5 py-4 font-black text-[var(--primary)] text-sm">RS {o.totalAmount?.toLocaleString()}</td>
                      <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.text}</span></td>
                    </tr>
                  ); })}
                  {recentOrders.length === 0 && <tr><td colSpan="4" className="px-5 py-10 text-center text-gray-300 text-sm italic">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Admin Dashboard ── */
  const adminStats = [
    { label: 'Total Sales',    value: `RS ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', bg: 'bg-yellow-50',  val_color: 'text-yellow-600' },
    { label: 'Total Orders',   value: stats?.totalOrders || 0,                             icon: '📦', bg: 'bg-blue-50',    val_color: 'text-blue-600'   },
    { label: 'Pending',        value: stats?.pendingOrders || 0,                           icon: '⏳', bg: 'bg-amber-50',   val_color: 'text-amber-600'  },
    { label: 'Delivered',      value: stats?.completedOrders || 0,                         icon: '✅', bg: 'bg-green-50',   val_color: 'text-green-600'  },
  ];

  const renderContent = () => {
    if (activeTab === 'orders')   return <div className="pt-2"><AdminOrdersPage /></div>;
    if (activeTab === 'products') return <div className="pt-2"><AdminProductsPage /></div>;
    if (activeTab === 'users')    return <div className="pt-2"><AdminUsersPage /></div>;
    if (activeTab === 'vendors')  return <div className="pt-2"><AdminVendorsPage /></div>;
    if (activeTab === 'settings') return <div className="pt-2"><AdminSettingsPage /></div>;

    // Overview
    return (
      <div className="p-4 sm:p-6 space-y-6">
        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`${s.bg} rounded-[40px] p-5 flex items-center gap-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{s.label}</p>
                <p className={`text-2xl font-black ${s.val_color}`}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart + quick stats */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-gray-800 text-base">Order Activity</h3>
                <p className="text-xs text-gray-400">{chartMode === 'weekly' ? 'Last 7 days' : 'Last 6 months'}</p>
              </div>
              <div className="flex gap-1.5">
                {['weekly','monthly'].map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartMode === m ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={v => [`${v} orders`]} />
                  <Area type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={3} fill="url(#g2)" dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800 text-base">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Order #</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell">Customer</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => { const s = getStatusBadge(o.status); return (
                  <tr key={o._id} onClick={() => navigate(`/orders/${o._id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-black text-sm text-gray-800">#{o.orderNumber}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell">{o.user?.name || o.customerName || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-400 hidden md:table-cell">{new Date(o.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</td>
                    <td className="px-5 py-4 font-black text-[var(--primary)] text-sm">RS {o.totalAmount?.toLocaleString()}</td>
                    <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.text}</span></td>
                  </tr>
                ); })}
                {recentOrders.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-300 text-sm italic">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          {/* Current page title */}
          <div>
            <h1 className="font-black text-gray-800 text-lg capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Mitchell's Factory</p>
          </div>

          {/* Right: live + user */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-600">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-gray-700 leading-none">{user?.name}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="overflow-y-auto flex-1" style={{ height: 'calc(100vh - 65px)' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
