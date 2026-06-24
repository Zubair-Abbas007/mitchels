import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, couponAPI } from '../services/api';
import { FiX, FiMapPin, FiArrowRight, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash on Delivery',
    sub: 'Pay when you receive',
    icon: '💵',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard',
    icon: '💳',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    sub: 'Mobile wallet payment',
    icon: '🔴',
    color: '#EE1C25',
  },
  {
    id: 'easypaisa',
    label: 'EasyPaisa',
    sub: 'Mobile wallet payment',
    icon: '🟢',
    color: '#4CAF50',
  },
];

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null); // { discount, code }
  const [couponLoading, setCouponLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    notes: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) {
      setFormData({ street: '', city: '', notes: '', paymentMethod: 'cash' });
      setCouponCode('');
      setCoupon(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate({ code: couponCode });
      setCoupon(res.data);
      toast.success(`Coupon applied! ${res.data.discount}% off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon.');
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const discountedTotal = coupon
    ? Math.round(cartTotal * (1 - coupon.discount / 100))
    : cartTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty.'); return; }
    if (!formData.street || !formData.city) { toast.error('Please fill in your delivery address.'); return; }

    setLoading(true);
    try {
      await orderAPI.create({
        items: cart.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          image: item.image,
        })),
        totalAmount: discountedTotal + 150,
        couponCode: coupon ? coupon.code : '',
        discountAmount: coupon ? (cartTotal - discountedTotal) : 0,
        deliveryAddress: { street: formData.street, city: formData.city, notes: formData.notes },
        paymentMethod: formData.paymentMethod,
      });
      if (coupon) await couponAPI.redeem({ code: coupon.code });
      toast.success('Order placed successfully!');
      clearCart();
      onClose();
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
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
            <div className="shrink-0 px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-black">Checkout</h1>
                <p className="text-xs text-gray-400 mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} · RS {(coupon ? discountedTotal : cartTotal).toLocaleString()}</p>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                <FiX size={17} />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 min-h-0">
              <div className="flex flex-col gap-4">

                {/* Order summary */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <p className="font-black text-black text-sm mb-3">Order Summary</p>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item._id || item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}× {item.name}</span>
                        <span className="font-bold text-black">RS {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-black">RS {cartTotal.toLocaleString()}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-bold">Discount ({coupon.discount}%)</span>
                        <span className="font-bold text-green-600">- RS {(cartTotal - discountedTotal).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span className="font-bold text-black">RS 150</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-black text-black">Total</span>
                      <span className="font-black text-black text-lg">RS {(discountedTotal + 150).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Coupon input */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-black text-black mb-2 flex items-center gap-1"><FiTag size={12} /> Have a coupon?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="MITCH-XXXXXXXX"
                        disabled={!!coupon}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-black text-xs font-bold tracking-widest text-black placeholder-gray-300 transition-all disabled:opacity-50"
                      />
                      {coupon ? (
                        <button type="button" onClick={() => { setCoupon(null); setCouponCode(''); }}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-black border border-red-100 hover:bg-red-100 transition">
                          Remove
                        </button>
                      ) : (
                        <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                          className="px-3 py-2 rounded-xl bg-black text-white text-xs font-black hover:bg-gray-800 transition disabled:opacity-40">
                          {couponLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}
                        </button>
                      )}
                    </div>
                    {coupon && <p className="text-green-600 text-[10px] font-bold mt-1">✓ {coupon.discount}% discount applied</p>}
                  </div>
                </div>

                {/* Delivery address */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <p className="font-black text-black text-sm mb-3 flex items-center gap-2">
                    <FiMapPin size={14} /> Delivery Address
                  </p>
                  <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Street address" required
                      value={formData.street}
                      onChange={e => setFormData(f => ({ ...f, street: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-black text-sm text-black placeholder-gray-400 transition-all"
                    />
                    <input type="text" placeholder="City" required
                      value={formData.city}
                      onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-black text-sm text-black placeholder-gray-400 transition-all"
                    />
                    <input type="text" placeholder="Delivery notes (optional)"
                      value={formData.notes}
                      onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-black text-sm text-black placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <p className="font-black text-black text-sm mb-3">Payment Method</p>
                  <div className="flex flex-col gap-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} type="button"
                        onClick={() => setFormData(f => ({ ...f, paymentMethod: pm.id }))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          formData.paymentMethod === pm.id
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-gray-50 text-black hover:border-gray-400'
                        }`}
                      >
                        <span className="text-xl shrink-0">{pm.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm leading-none">{pm.label}</p>
                          <p className={`text-xs mt-0.5 ${formData.paymentMethod === pm.id ? 'text-white/70' : 'text-gray-400'}`}>{pm.sub}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          formData.paymentMethod === pm.id ? 'border-white' : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place order */}
                <button type="submit" disabled={loading || cart.length === 0}
                  className="w-full py-4 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 shadow-lg">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Place Order <FiArrowRight size={15} /></>}
                </button>

                <p className="text-center text-[10px] text-gray-400 pb-2">
                  By placing your order you agree to Mitchells' terms & conditions.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
