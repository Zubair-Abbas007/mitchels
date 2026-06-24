import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, 
  FiClock, FiPrinter, FiMapPin, FiCreditCard, FiUser,
  FiShoppingBag, FiInfo, FiXCircle, FiHash
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const OrderDetails = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getById(id);
      setOrder(res.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const markWorkerComplete = async () => {
    setUpdating(true);
    try {
      await orderAPI.workerComplete(id);
      toast.success('Order marked as ready by worker');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock size={20} />,
      confirmed: <FiCheckCircle size={20} />,
      preparing: <FiPackage size={20} />,
      ready: <FiTruck size={20} />,
      delivered: <FiCheckCircle size={20} />,
      cancelled: <FiInfo size={20} />
    };
    return icons[status] || <FiClock size={20} />;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'In Queue',
      confirmed: 'Confirmed',
      preparing: 'Gourmet Kitchen',
      ready: 'Ready for Service',
      delivered: 'Served',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const getStatusGroupColor = (status) => {
    const groups = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      preparing: 'text-indigo-600 bg-indigo-50',
      ready: 'text-purple-600 bg-purple-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50'
    };
    return groups[status] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-24">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-400 hover:text-[var(--text-dark)] transition-colors mb-8 text-xs font-black uppercase tracking-widest"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[40px] overflow-hidden border-white/50 shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[var(--primary)] p-6 sm:p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-60 mb-2 italic underline underline-offset-4 decoration-white/20">Curation Details</p>
                  <h1 className="serif text-2xl sm:text-4xl mb-1">Token #{order.orderNumber}</h1>
                  <div className="flex items-center gap-4 text-xs font-bold opacity-80">
                    <span className="flex items-center gap-1.5"><FiClock /> {new Date(order.createdAt).toLocaleString()}</span>
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                    <span className="flex items-center gap-1.5 capitalize"><FiTruck /> {order.paymentMethod === 'cash' ? 'Pay on Delivery' : 'Digital Payment'}</span>
                  </div>
               </div>
               <div className="flex gap-3 print:hidden">
                 <button onClick={() => window.print()} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all border border-white/10">
                   <FiPrinter size={20} />
                 </button>
               </div>
             </div>
          </div>
          
          {/* Status Tracker */}
          <div className="p-10 border-b border-gray-100/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
               <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${getStatusGroupColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-0.5">Current Stage</p>
                    <h3 className="text-2xl font-black text-[var(--text-dark)]">{getStatusText(order.status)}</h3>
                  </div>
               </div>

               {isAdmin && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex gap-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      disabled={updating}
                      className="px-6 py-3 rounded-2xl bg-white border border-gray-100 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[var(--primary)]/20 shadow-inner"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.status === 'preparing' && (
                      <button
                        onClick={markWorkerComplete}
                        disabled={updating}
                        className="btn-primary px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        {updating ? 'Updating...' : 'Ready by Worker'}
                      </button>
                    )}
                  </div>
               )}
            </div>

            {/* Premium Timeline */}
            <div className="relative pt-4 pb-8">
               <div className="absolute top-[42px] left-0 right-0 h-[2px] bg-gray-100 mx-4"></div>
               <div 
                 className="absolute top-[42px] left-0 h-[2px] bg-[var(--primary)] transition-all duration-1000 shadow-[0_0_10px_rgba(62,101,83,0.3)] mx-4"
                 style={{
                   width: `calc(${
                     ['pending', 'confirmed', 'preparing', 'ready', 'delivered'].indexOf(order.status) * 25
                   }% - 2rem)`
                 }}
               ></div>
               
               <div className="flex justify-between relative z-10">
                  {['pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((s, i) => {
                    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                    const isCompleted = statusOrder.indexOf(order.status) >= i;
                    return (
                      <div key={s} className="flex flex-col items-center">
                         <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-[var(--bg-cream)] ${
                           isCompleted ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-300'
                         }`}>
                           <FiCheckCircle size={12} />
                         </div>
                         <p className={`hidden sm:block text-[8px] uppercase font-black tracking-widest mt-3 ${isCompleted ? 'text-[var(--primary)]' : 'text-gray-300'}`}>
                           {getStatusText(s)}
                         </p>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
          
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100/50">
             <div className="p-6 sm:p-10">
                <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <FiUser className="text-[var(--primary)]" /> Guest Detail
                </h3>
                <div className="space-y-4">
                   <div>
                     <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Name</p>
                     <p className="font-bold text-[var(--text-dark)]">{order.customerName || order.user?.name}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Digital Address</p>
                     <p className="font-medium text-gray-600 text-sm italic">{order.customerEmail || order.user?.email}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Phone</p>
                     <p className="font-medium text-gray-600 text-sm">{order.customerPhone}</p>
                   </div>
                </div>
             </div>
             <div className="p-10">
                <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <FiMapPin className="text-[var(--primary)]" /> Destination
                </h3>
                <div className="space-y-4">
                   <p className="text-sm text-[var(--text-dark)] font-bold italic leading-relaxed">
                     {order.deliveryAddress?.street},<br />
                     {order.deliveryAddress?.city}
                   </p>
                   {order.deliveryAddress?.notes && (
                     <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                        <p className="text-[10px] text-gray-300 font-black uppercase mb-1">Driver Note</p>
                        <p className="text-xs text-gray-500 italic">"{order.deliveryAddress.notes}"</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          {/* Itemized Curation */}
          <div className="p-10 border-t border-gray-100/50">
             <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 mb-8 flex items-center gap-2">
               <FiShoppingBag className="text-[var(--primary)]" /> Selected Items
             </h3>
             <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 pb-4">
                      <th className="text-left py-4 text-[10px] font-black uppercase text-gray-300">Item Name</th>
                      <th className="text-center py-4 text-[10px] font-black uppercase text-gray-300">Qty</th>
                      <th className="text-right py-4 text-[10px] font-black uppercase text-gray-300 hidden sm:table-cell">Price</th>
                      <th className="text-right py-4 text-[10px] font-black uppercase text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {order.items?.map((item, index) => (
                      <tr key={index} className="group">
                        <td className="py-4 pr-2 sm:py-6 sm:pr-4">
                           <div className="flex items-center gap-2 sm:gap-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                 <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100"} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-[var(--text-dark)] text-sm line-clamp-1">{item.name}</span>
                           </div>
                        </td>
                        <td className="py-4 sm:py-6 text-center text-sm font-black text-gray-400">x{item.quantity}</td>
                        <td className="py-4 sm:py-6 text-right text-sm text-gray-500 hidden sm:table-cell">RS {item.price?.toLocaleString()}</td>
                        <td className="py-4 sm:py-6 text-right font-black text-[var(--text-dark)] text-sm">RS {item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             
             <div className="mt-10 pt-10 border-t border-[var(--primary)]/10 flex flex-col items-end">
                <div className="flex items-center gap-12 mb-2">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Curation Total</span>
                   <span className="text-3xl font-black text-[var(--primary)]">RS {order.totalAmount?.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-300 font-bold italic tracking-wider">Prices include all Mitchells Premium fees</p>
             </div>
          </div>
          
          {/* Worker / Payment / Support */}
          <div className="p-10 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-10">
             <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3 italic">Vault Security</h4>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[var(--primary)]">
                      <FiCreditCard size={14} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[var(--text-dark)] capitalize">{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Digital Card'}</p>
                      <p className={`text-[10px] font-black uppercase tracking-tighter ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus === 'paid' ? 'Transaction Settled' : 'Payment Awaited'}
                      </p>
                   </div>
                </div>
             </div>
             <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3 italic">Gourmet Support</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Need assistance with your curation? Contact our concierge at <span className="text-[var(--primary)] font-bold">concierge@mitchells.com.pk</span></p>
             </div>
             <div className="flex flex-col items-end justify-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner text-[var(--primary)]/10">
                   <FiShoppingBag size={32} />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails;