import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import CheckoutModal from './CheckoutModal';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setSelected(cart.map(i => i._id || i.id));
  }, [cart]);

  const allSelected = selected.length === cart.length && cart.length > 0;
  const toggleSelectAll = () => setSelected(allSelected ? [] : cart.map(i => i._id || i.id));
  const toggleItem = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const deleteSelected = () => { selected.forEach(id => removeFromCart(id)); setSelected([]); };

  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const deliveryFee = cart.length > 0 ? 150 : 0;
  const total = cartTotal - discount + deliveryFee;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'MITCHELLS10') setCouponApplied(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full bg-[#f5f5f5] rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
              style={{ maxWidth: '520px', height: '92vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 px-6 pt-6 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-xl font-black text-black">Your Shopping Cart</h1>
                  <button onClick={onClose}
                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <FiX size={17} />
                  </button>
                </div>
                {/* Steps */}
                <div className="flex items-center">
                  {[{ n: 1, label: 'Cart' }, { n: 2, label: 'Checkout' }, { n: 3, label: 'Complete' }].map((s, i) => (
                    <div key={s.n} className="flex items-center">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${s.n === 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {s.n}
                        </div>
                        <span className={`text-xs font-semibold ${s.n === 1 ? 'text-black' : 'text-gray-400'}`}>{s.label}</span>
                      </div>
                      {i < 2 && <div className="w-8 h-px bg-gray-300 mx-2" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable body — single column */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 min-h-0">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 text-gray-300 shadow-inner">
                      <FiShoppingBag size={32} />
                    </div>
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest mb-1">Cart is empty</p>
                    <p className="text-gray-300 text-xs mb-6">Add some products to get started</p>
                    <button onClick={() => { onClose(); navigate('/products'); }}
                      className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">

                    {/* Select all bar */}
                    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <label className="flex items-center gap-2.5 cursor-pointer" onClick={toggleSelectAll}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                          {allSelected && <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none"><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-sm font-semibold text-black">Select All</span>
                        {selected.length > 0 && selected.length < cart.length && (
                          <span className="text-xs text-gray-400">({selected.length})</span>
                        )}
                      </label>
                      <button onClick={deleteSelected} disabled={selected.length === 0}
                        className="px-5 py-2 rounded-full bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-40">
                        Delete
                      </button>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
                      <AnimatePresence>
                        {cart.map((item) => {
                          const id = item._id || item.id;
                          const isSel = selected.includes(id);
                          return (
                            <motion.div key={id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className={`flex items-center gap-3 px-4 py-3.5 ${isSel ? 'bg-gray-50' : ''}`}>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${isSel ? 'bg-black border-black' : 'border-gray-300'}`}
                                onClick={() => toggleItem(id)}>
                                {isSel && <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none"><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100'} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-black text-sm leading-tight line-clamp-1">{item.name}</p>
                                <p className="font-bold text-black text-sm mt-1">RS {item.price?.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
                                  <button onClick={() => updateQuantity(id, item.quantity - 1)} className="text-gray-500 hover:text-black transition"><FiMinus size={12} /></button>
                                  <span className="text-sm font-black text-black w-4 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(id, item.quantity + 1)} className="text-gray-500 hover:text-black transition"><FiPlus size={12} /></button>
                                </div>
                                <button onClick={() => removeFromCart(id)}
                                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all">
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Order Summary — below items */}
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <p className="font-black text-black text-base mb-4">Order Summary</p>

                      {/* Coupon */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 min-w-0">
                          <FiTag size={13} className="text-gray-400 shrink-0" />
                          <input type="text" placeholder="Coupon Code"
                            value={coupon} onChange={e => setCoupon(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                            className="flex-1 bg-transparent text-sm outline-none text-black placeholder-gray-400 min-w-0" />
                        </div>
                        <button onClick={applyCoupon}
                          className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shrink-0">
                          Apply
                        </button>
                      </div>
                      {couponApplied && <p className="text-green-600 text-xs font-bold mb-3">✓ 10% discount applied!</p>}

                      <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-bold text-black">RS {cartTotal.toLocaleString()}</span>
                        </div>
                        {couponApplied && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Discount (10%)</span>
                            <span className="font-bold text-red-500">-RS {discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Fee</span>
                          <span className="font-bold text-black">RS {deliveryFee}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-100">
                          <span className="font-black text-black text-base">Total</span>
                          <span className="font-black text-black text-lg">RS {total.toLocaleString()}</span>
                        </div>
                      </div>

                      <button onClick={() => setShowCheckout(true)}
                        className="w-full mt-5 py-3.5 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all">
                        Go to Checkout <FiArrowRight size={15} />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
};

export default CartModal;
