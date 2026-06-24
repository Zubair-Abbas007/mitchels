import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiTruck, FiCheckCircle, FiStar,
  FiChevronRight, FiChevronLeft, FiArrowRight,
  FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiHeart
} from 'react-icons/fi';
import { productAPI } from '../services/api';
import { couponAPI } from '../services/api';
import emailjs from '@emailjs/browser';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

/* ── Mitchells Bird Logo — hummingbird in circle (blue + red rings) ── */
const MitchellsBird = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer blue ring */}
    <circle cx="50" cy="50" r="48" fill="white" stroke="#1a2a8f" strokeWidth="3.5"/>
    {/* Inner red ring */}
    <circle cx="50" cy="50" r="42" fill="white" stroke="#cc1111" strokeWidth="2"/>

    {/* ── Hummingbird body ── */}
    {/* Main body */}
    <path d="M48 58 Q42 52 40 44 Q44 40 50 42 Q56 44 56 52 Q54 58 48 58Z" fill="#1a2a8f"/>
    {/* Chest white highlight */}
    <path d="M48 58 Q45 54 44 48 Q46 46 49 48 Q51 52 50 58Z" fill="white" opacity="0.3"/>

    {/* Left wing — sweeping up-left */}
    <path d="M44 46 Q32 30 22 24 Q28 32 34 40 Q38 44 42 46Z" fill="#1a2a8f"/>
    <path d="M44 46 Q34 32 26 27 Q30 34 36 41Z" fill="white" opacity="0.2"/>

    {/* Right wing — sweeping up-right */}
    <path d="M54 44 Q66 28 76 22 Q70 30 64 38 Q60 42 56 44Z" fill="#1a2a8f"/>
    <path d="M54 44 Q64 30 72 25 Q68 32 62 39Z" fill="white" opacity="0.2"/>

    {/* Head */}
    <ellipse cx="50" cy="40" rx="7" ry="6.5" fill="#1a2a8f"/>
    {/* Head white highlight */}
    <path d="M46 37 Q50 34 54 37 Q52 35 50 35 Q48 35 46 37Z" fill="white" opacity="0.25"/>

    {/* Beak — long, pointing left */}
    <path d="M43 40 L22 38 L43 42Z" fill="#1a2a8f"/>

    {/* Eye */}
    <circle cx="47" cy="39" r="2.5" fill="white"/>
    <circle cx="47" cy="39" r="1.2" fill="#1a2a8f"/>
    <circle cx="46.5" cy="38.5" r="0.4" fill="white"/>

    {/* Tail feathers — fanned downward */}
    <path d="M44 60 Q40 68 36 74 Q42 68 46 62Z" fill="#1a2a8f"/>
    <path d="M46 62 Q44 72 42 78 Q46 70 48 64Z" fill="#1a2a8f"/>
    <path d="M48 63 Q48 74 48 80 Q50 72 50 65Z" fill="#1a2a8f"/>
    <path d="M50 63 Q52 74 54 80 Q52 72 51 65Z" fill="#1a2a8f"/>
    <path d="M52 62 Q56 72 58 78 Q55 70 53 64Z" fill="#1a2a8f"/>
    <path d="M54 60 Q60 68 64 74 Q58 68 55 62Z" fill="#1a2a8f"/>

    {/* White feather separators on tail */}
    <path d="M44 60 L36 74" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M46 62 L42 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M48 63 L48 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M50 63 L54 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M52 62 L58 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
  </svg>
);

const MitchellsLogo = () => (
  <div className="flex items-center gap-2.5">
    <MitchellsBird className="w-11 h-11" />
    <div>
      <p className="font-black tracking-tight text-[#1a2a8f] leading-none text-lg">MITCHELL'S</p>
      <p className="font-bold tracking-widest text-[#cc1111] uppercase leading-none mt-0.5 text-[8px]">Farm Fresh Since 1933</p>
    </div>
  </div>
);

/* ── Contact Modal ── */
const CONTACT_SERVICE  = 'service_mv6rkb5';
const CONTACT_TEMPLATE = 'template_wll9zyj';
const CONTACT_PUBLIC   = 'l5RxBKO4o7WNr5SFD';

const ContactModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await emailjs.send(
        CONTACT_SERVICE,
        CONTACT_TEMPLATE,
        {
          to_name: 'Mitchells Admin',
          to_email: 'za314944@gmail.com',
          otp: `New Contact Message\n\nFrom: ${form.name}${form.company ? ` (${form.company})` : ''}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
        },
        CONTACT_PUBLIC
      );
      setSent(true);
    } catch {
      // still show thank you — don't block UX
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      {/* Thank you sticky note */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, rotate: -6, scale: 0.7, y: 60 }}
            animate={{ opacity: 1, rotate: -6, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute bottom-12 right-6 sm:bottom-16 sm:right-14 z-30 cursor-pointer select-none"
            onClick={onClose}
          >
            <div className="relative px-8 py-6 shadow-2xl"
              style={{ background: '#d4f542', transform: 'rotate(-6deg)', minWidth: '210px', borderRadius: '4px' }}>
              <button className="absolute top-2 right-3 text-black/40 hover:text-black text-lg font-black leading-none">×</button>
              <p className="text-2xl font-black text-black leading-tight mb-1">Thank you!</p>
              <p className="text-sm text-black/70 font-medium">Your request was sent</p>
              <div className="absolute -bottom-3 right-5 text-2xl">🖤</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card — vertically expanded, light background */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full overflow-y-auto"
        style={{
          maxWidth: '640px',
          maxHeight: '96vh',
          minHeight: '80vh',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.96)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-6 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-black transition-all text-xl font-light">
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">          {/* ── Left ── */}
          <div className="p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
            <div>
              <h1 className="text-5xl sm:text-6xl font-black text-black mb-5 leading-none tracking-tight">
                Contact
              </h1>
              <p className="text-xs uppercase tracking-widest text-gray-500 leading-relaxed max-w-xs mb-8">
                Our team is here to help. Fill out the form and we will get back to you promptly.
              </p>

              {/* Contact details */}
              <div className="space-y-4 mb-8">
                <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-black flex items-center justify-center transition-all">
                    <FiMail size={15} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-black font-medium group-hover:underline">za314944@gmail.com</span>
                </a>
                <a href="tel:+9242111000111"
                  className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-black flex items-center justify-center transition-all">
                    <FiPhone size={15} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-black font-medium group-hover:underline">+92 42 111 000 111</span>
                </a>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiMapPin size={15} className="text-gray-600" />
                  </div>
                  <span className="text-sm text-black font-medium">17-Km Raiwind Road, Lahore</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-3">
                <a href="https://www.instagram.com/mitchellspakistan" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                  title="Instagram">
                  <FiInstagram size={17} />
                </a>
                <a href="https://www.facebook.com/MitchellsPakistan" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md"
                  style={{ background: '#1877F2' }}
                  title="Facebook">
                  <FiFacebook size={17} />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md bg-gray-800"
                  title="Email us">
                  <FiMail size={17} />
                </a>
              </div>
            </div>

            <div className="mt-10 text-3xl select-none">🖤</div>
          </div>

          {/* ── Right: form ── */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-xl font-black text-black mb-6 tracking-tight">Send a message</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Name</label>
                  <input type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Company</label>
                  <input type="text"
                    value={form.company || ''}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
                <input type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Message</label>
                <textarea required rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Type something if you want..."
                  className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent resize-none font-medium placeholder-gray-300"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button type="submit" disabled={sending || sent}
                  className="px-10 py-3.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : sent ? '✓ Sent!' : 'Submit'}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed">
                By clicking Submit, I am giving consent to process my personal data provided in the form.
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* Card color palette — cycles through products */
const CARD_COLORS = [
  { bg: '#e8524a', light: '#f07068' },  // red-pink
  { bg: '#f07c2a', light: '#f59040' },  // orange
  { bg: '#5cb85c', light: '#72cc72' },  // green
  { bg: '#6c63ff', light: '#8b83ff' },  // purple
  { bg: '#e8524a', light: '#f07068' },
  { bg: '#f07c2a', light: '#f59040' },
  { bg: '#5cb85c', light: '#72cc72' },
  { bg: '#6c63ff', light: '#8b83ff' },
  { bg: '#e8524a', light: '#f07068' },
  { bg: '#f07c2a', light: '#f59040' },
];

/* ── Dish Card — colorful with overflowing circle image ── */
const DishCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.22 }}
      className="relative flex flex-col cursor-pointer"
      style={{ width: 'clamp(150px, 42vw, 200px)' }}
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Circle image overflowing top */}
      <div className="relative z-10 flex justify-center" style={{ marginBottom: '-52px' }}>
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl"
          style={{ border: `5px solid ${color.bg}` }}>
          <img
            src={product.image} alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'; }}
          />
        </div>
      </div>

      {/* Colored card body */}
      <div className="rounded-[20px] pt-16 pb-5 px-5 flex flex-col flex-1"
        style={{ background: `linear-gradient(160deg, ${color.bg} 0%, ${color.light} 100%)` }}>

        {/* Name */}
        <h3 className="font-black text-white text-sm leading-tight mb-3 line-clamp-2">{product.name}</h3>

        {/* Price + heart */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-white text-lg">RS {product.price}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-all"
          >
            <FiHeart size={14} className={liked ? 'fill-current text-red-500' : 'text-red-400'} />
          </button>
        </div>

        {/* Order Now + rating */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
            className="flex items-center gap-1 bg-white text-gray-700 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-gray-50 transition-all shadow-sm"
          >
            Order Now <FiArrowRight size={10} />
          </button>
          <div className="flex items-center gap-1">
            <FiStar size={11} className="fill-current text-yellow-300" />
            <span className="text-white text-[10px] font-black">{product.rating || '5.0'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Coupon Section ── */
const COUPON_SERVICE  = 'service_mv6rkb5';
const COUPON_TEMPLATE = 'template_wll9zyj';
const COUPON_PUBLIC   = 'l5RxBKO4o7WNr5SFD';

const CouponSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await couponAPI.generate({ email });
      const { code, discount, alreadyHad } = res.data;

      // Send via EmailJS
      await emailjs.send(
        COUPON_SERVICE,
        COUPON_TEMPLATE,
        { to_name: email.split('@')[0], to_email: email, otp: `Your 30% discount coupon: ${code} (valid 48 hours, one-time use)` },
        COUPON_PUBLIC
      );

      setCoupon({ code, discount });
      toast.success(alreadyHad ? 'Your existing coupon has been resent!' : 'Coupon sent to your email!');
    } catch (err) {
      toast.error('Failed to generate coupon. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="relative rounded-[50px] bg-black overflow-hidden p-12 md:p-24 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] opacity-20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)] opacity-10 blur-[100px]" />
        <div className="relative z-10">
          <h2 className="serif text-4xl md:text-6xl text-white mb-4">
            Get Your Exclusive <br />
            <span className="text-[var(--primary)]">30% Discount Coupon</span>
          </h2>
          <p className="text-white/50 text-sm mb-10">One-time use · Valid for 48 hours · Sent to your email</p>

          {!coupon ? (
            <form onSubmit={handleGenerate} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 py-4 px-6 rounded-full bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] backdrop-blur-lg placeholder-white/40 text-sm"
              />
              <button type="submit" disabled={loading}
                className="bg-[var(--primary)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--primary-dark)] transition flex items-center justify-center gap-2 text-sm shrink-0">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Get Coupon'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Your Coupon Code</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl font-black text-white tracking-widest">{coupon.code}</span>
                  <button onClick={handleCopy}
                    className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-[var(--primary)]/20 rounded-2xl px-6 py-3 inline-block">
                  <span className="text-[var(--primary)] font-black text-lg">{coupon.discount}% OFF</span>
                  <span className="text-white/50 text-xs ml-2">on your next order</span>
                </div>
                <p className="text-white/40 text-xs mt-4">Also sent to your email · Valid 48 hours · One-time use</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ── Main Page ── */
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const visibleCount = 4;

  useEffect(() => {
    document.title = 'Mitchells — Gourmet Experience';
    fetchProducts();
    fetchReviews();
    document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await productAPI.getLatestReviews();
      setReviews(res.data.data || []);
    } catch {}
  };

  // Auto-open contact modal when navigated from footer with ?contact=1
  useEffect(() => {
    if (location.search.includes('contact=1')) {
      setShowContact(true);
      window.history.replaceState({}, '', '/');
    }
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxIdx = Math.max(0, products.length - visibleCount);
  const next = () => setSlideIdx(i => Math.min(i + 1, maxIdx));
  const prev = () => setSlideIdx(i => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] overflow-x-hidden">

      {/* ── Contact Modal ── */}
      <AnimatePresence>
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-cream)]/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <MitchellsLogo />
          <div className="hidden md:flex items-center gap-10 font-medium text-sm text-[var(--text-dark)]">
            <Link to="/products" className="hover:text-[var(--primary)] transition-colors">Menu</Link>
            <Link to="/about" className="hover:text-[var(--primary)] transition-colors">About Us</Link>
            <Link to="/bulk-order" className="hover:text-[var(--primary)] transition-colors">Bulk Order</Link>
            <button onClick={() => setShowContact(true)} className="hover:text-[var(--primary)] transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-[var(--text-dark)] px-6 py-2 rounded-full border border-black/10 hover:bg-black/5 transition">Login</Link>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-[var(--bg-cream)]/95 backdrop-blur-md border-t border-black/5"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[var(--text-dark)]">
                <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--primary)] transition-colors">Menu</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--primary)] transition-colors">About Us</Link>
                <Link to="/bulk-order" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--primary)] transition-colors">Bulk Order</Link>
                <button onClick={() => { setShowContact(true); setMobileMenuOpen(false); }} className="text-left hover:text-[var(--primary)] transition-colors">Contact</button>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--primary)] transition-colors">Login</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="serif text-4xl sm:text-6xl md:text-8xl text-[var(--text-dark)] leading-[1.1] mb-8">
              it's not just <br />
              Food, It's an <br />
              <span className="text-[var(--primary)]">Experience.</span>
            </h1>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/products" className="btn-accent text-base sm:text-lg px-5 sm:px-8">View Menu</Link>
              <button onClick={() => setShowContact(true)} className="btn-ghost text-base sm:text-lg px-5 sm:px-8">Contact Us</button>
            </div>
            <div className="space-y-4">
              <p className="text-[var(--text-muted)] font-medium">Reviews</p>
              {reviews.length > 0 ? (
                <div className="flex flex-wrap items-center gap-4">
                  {/* Real user avatars */}
                  <div className="flex -space-x-3">
                    {reviews.slice(0, 4).map((r, i) => (
                      <div key={i}
                        className="w-12 h-12 rounded-full border-4 border-[var(--bg-cream)] flex items-center justify-center font-black text-sm text-white shrink-0"
                        style={{ background: `hsl(${(r.userName?.charCodeAt(0) || 0) * 37 % 360}, 60%, 45%)` }}
                        title={r.userName}>
                        {r.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    ))}
                    {reviews.length > 4 && (
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold border-4 border-[var(--bg-cream)]">
                        {reviews.length}+
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex text-[#FFD700]">
                      {[1,2,3,4,5].map(i => <FiStar key={i} className="fill-current" />)}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-bold mt-1">
                      {(reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)} ({reviews.length} Reviews)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-[var(--bg-cream)] object-cover" alt="User" />
                    ))}
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold border-4 border-[var(--bg-cream)]">45+</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex text-[#FFD700]">
                      {[1,2,3,4,5].map(i => <FiStar key={i} className="fill-current" />)}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-bold mt-1">4.9 (12.4k Reviews)</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: animated circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex items-center justify-center min-h-[320px] sm:min-h-[420px] lg:min-h-[580px]"
          >
            {/* Rotating rings — hidden on small screens to prevent overflow */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute hidden sm:block w-[380px] h-[380px] lg:w-[600px] lg:h-[600px] rounded-full border-2 border-dashed border-[var(--primary)]/20" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute hidden sm:block w-[320px] h-[320px] lg:w-[540px] lg:h-[540px] rounded-full border border-[var(--primary)]/10" />
            <div className="absolute w-48 h-48 lg:w-96 lg:h-96 rounded-full bg-[var(--primary)]/6 blur-3xl" />

            {/* Main circle — responsive size */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="rounded-full overflow-hidden shadow-2xl dish-shadow"
                style={{ width: 'clamp(200px, 45vw, 28rem)', height: 'clamp(200px, 45vw, 28rem)' }}>
                <img
                  src="https://i.pinimg.com/1200x/75/58/3d/75583d16fb1d8a7dbd0dea8db482fee9.jpg"
                  alt="Artichoke Hearts" className="w-full h-full object-cover"
                />
              </div>

              {/* Discount badge */}
              <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-6 bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xs sm:text-sm">5%</div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-orange-600">Discount</p>
                    <p className="text-[8px] sm:text-[9px] text-gray-400">first 2 orders</p>
                  </div>
                </div>
              </motion.div>

              {/* Orbiting food circles */}
              <motion.div animate={{ y: [0, -12, 0], x: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-8 -left-10 rounded-full overflow-hidden shadow-lg"
                style={{ width: '4.5rem', height: '4.5rem' }}>
                <img src="https://i.pinimg.com/1200x/87/4d/c8/874dc8274b2a91771b6594ffe0d3dab8.jpg" className="w-full h-full object-cover" alt="Product 1" />
              </motion.div>
              <motion.div animate={{ y: [0, 12, 0], x: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute top-6 -left-14 w-14 h-14 rounded-full overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Strawberry Jam" />
              </motion.div>
              <motion.div animate={{ y: [0, -8, 0], x: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -right-10 w-12 h-12 rounded-full overflow-hidden shadow-lg">
                <img src="https://i.pinimg.com/1200x/d7/63/aa/d763aa7fdbe079beae6325624b81cbdc.jpg" className="w-full h-full object-cover" alt="Product 2" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <FiShoppingBag />, title: 'Easy To Order', text: 'Order your favorite meals in just a few clicks through our modern platform.' },
              { icon: <FiTruck />, title: 'Fastest Delivery', text: 'We ensure your food arrives hot and fresh anywhere in the city within minutes.' },
              { icon: <FiCheckCircle />, title: 'Best Quality', text: 'Only the finest ingredients sourced from local organic Mitchells farms.' },
            ].map((f, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-[var(--bg-cream)] text-[var(--primary)] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 dish-shadow">
                  {f.icon}
                </div>
                <h3 className="serif text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs mx-auto">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Special Dishes ── */}
      <section className="py-16 px-6" style={{ background: '#fdf6ee' }}>
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)] mb-2">Chef's Selection</p>
            <h2 className="serif text-4xl md:text-5xl text-[var(--text-dark)] mb-3">Our Special Dishes</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm">Hand-picked gourmet specialties from the Mitchells kitchen.</p>
          </div>

          {/* Carousel with side arrows */}
          <div className="relative flex items-center justify-center gap-4">
            {/* Prev arrow */}
            <button onClick={prev} disabled={slideIdx === 0}
              className="shrink-0 w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 border border-gray-100">
              <FiChevronLeft size={22} />
            </button>

            {/* Cards viewport — paddingTop gives room for overflowing images */}
            <div style={{ width: '100%', maxWidth: '872px', overflow: 'visible' }}>
              {loading ? (
                <div className="flex gap-6 justify-center" style={{ paddingTop: '60px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="shrink-0 w-[200px] h-64 rounded-[20px] animate-pulse" style={{ background: '#e8e0d8' }} />
                  ))}
                </div>
              ) : (
                <div style={{ overflow: 'hidden', paddingTop: '60px', paddingBottom: '8px' }}>
                  <motion.div
                    className="flex gap-6"
                    animate={{ x: -slideIdx * (200 + 24) }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {products.map((product, i) => (
                      <div key={product._id} className="shrink-0">
                        <DishCard product={product} index={i} />
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Next arrow */}
            <button onClick={next} disabled={slideIdx >= maxIdx}
              className="shrink-0 w-12 h-12 rounded-full bg-[#e8524a] text-white shadow-lg hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10">
              <FiChevronRight size={22} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all duration-300 ${slideIdx === i ? 'w-6 h-2.5 bg-[var(--primary)]' : 'w-2.5 h-2.5 bg-gray-300'}`} />
            ))}
          </div>

          {/* View all */}
          <div className="text-center mt-10">
            <Link to="/products" className="inline-flex items-center gap-2 text-[var(--primary)] font-black text-sm uppercase tracking-widest border-b-2 border-[var(--primary)]/20 hover:border-[var(--primary)] transition-all pb-1">
              View Full Menu <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Coupon Section ── */}
      <CouponSection />

      <Footer />
    </div>
  );
};

export default Home;
