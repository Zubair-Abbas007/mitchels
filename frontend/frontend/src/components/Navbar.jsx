import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiLogOut, FiUser, FiTruck, FiShoppingBag, FiHeart } from 'react-icons/fi';
import CartModal from './CartModal';
import WishlistDrawer from './WishlistDrawer';
import { useWishlist } from '../context/WishlistContext';

/* ── Mitchells Bird Logo SVG ── */
const MitchellsBird = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#1a2a8f" strokeWidth="3.5"/>
    <circle cx="50" cy="50" r="42" fill="white" stroke="#cc1111" strokeWidth="2"/>
    <path d="M48 58 Q42 52 40 44 Q44 40 50 42 Q56 44 56 52 Q54 58 48 58Z" fill="#1a2a8f"/>
    <path d="M48 58 Q45 54 44 48 Q46 46 49 48 Q51 52 50 58Z" fill="white" opacity="0.3"/>
    <path d="M44 46 Q32 30 22 24 Q28 32 34 40 Q38 44 42 46Z" fill="#1a2a8f"/>
    <path d="M44 46 Q34 32 26 27 Q30 34 36 41Z" fill="white" opacity="0.2"/>
    <path d="M54 44 Q66 28 76 22 Q70 30 64 38 Q60 42 56 44Z" fill="#1a2a8f"/>
    <path d="M54 44 Q64 30 72 25 Q68 32 62 39Z" fill="white" opacity="0.2"/>
    <ellipse cx="50" cy="40" rx="7" ry="6.5" fill="#1a2a8f"/>
    <path d="M43 40 L22 38 L43 42Z" fill="#1a2a8f"/>
    <circle cx="47" cy="39" r="2.5" fill="white"/>
    <circle cx="47" cy="39" r="1.2" fill="#1a2a8f"/>
    <circle cx="46.5" cy="38.5" r="0.4" fill="white"/>
    <path d="M44 60 Q40 68 36 74 Q42 68 46 62Z" fill="#1a2a8f"/>
    <path d="M46 62 Q44 72 42 78 Q46 70 48 64Z" fill="#1a2a8f"/>
    <path d="M48 63 Q48 74 48 80 Q50 72 50 65Z" fill="#1a2a8f"/>
    <path d="M50 63 Q52 74 54 80 Q52 72 51 65Z" fill="#1a2a8f"/>
    <path d="M52 62 Q56 72 58 78 Q55 70 53 64Z" fill="#1a2a8f"/>
    <path d="M54 60 Q60 68 64 74 Q58 68 55 62Z" fill="#1a2a8f"/>
    <path d="M44 60 L36 74" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M46 62 L42 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M48 63 L48 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M50 63 L54 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M52 62 L58 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
  </svg>
);

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render on home page, auth pages, or admin dashboard
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password') return null;
  if (isAdmin && location.pathname === '/dashboard') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = isAdmin ? [] : [
    { to: '/products', label: 'Menu' },
    { to: '/about', label: 'About Us' },
    { to: '/bulk-order', label: 'Bulk Order' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 lg:px-12 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className={`container mx-auto px-8 py-4 rounded-[32px] transition-all duration-700 flex items-center justify-between border ${scrolled ? 'bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl shadow-black/5' : 'bg-transparent border-transparent'}`}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <MitchellsBird className="w-11 h-11" />
            <div className="hidden sm:block">
              <p className="font-black text-[#1a2a8f] text-base tracking-tight leading-none">MITCHELL'S</p>
              <p className="text-[7px] uppercase font-bold tracking-[0.35em] text-[#cc1111] mt-0.5">Farm Fresh Since 1933</p>
            </div>
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden lg:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to}
                className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all relative group ${location.pathname === link.to ? 'text-[var(--primary)]' : 'text-gray-500 hover:text-[var(--primary)]'}`}>
                {link.label}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full ${location.pathname === link.to ? 'w-full' : 'w-0'}`} />
              </Link>
            ))}
            {/* Admin links removed — sidebar handles navigation */}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 relative z-10">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 hover:scale-105 transition-all duration-300">
                  <FiUser size={17} className="text-[var(--primary)]" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-[20px] shadow-2xl border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="font-black text-xs text-[var(--text-dark)] truncate">{user?.name}</p>
                    <p className="text-[8px] text-gray-300 uppercase font-black tracking-widest mt-0.5">{user?.role}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:bg-gray-50 hover:text-[var(--primary)] rounded-xl transition-all">
                    <FiHome size={13} /> Dashboard
                  </Link>
                  {!isAdmin && (
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:bg-gray-50 hover:text-[var(--primary)] rounded-xl transition-all">
                      <FiTruck size={13} /> My Orders
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase font-black tracking-widest text-[var(--accent)] hover:bg-red-50 rounded-xl transition-all text-left">
                    <FiLogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block btn-primary text-[10px] font-black uppercase tracking-widest px-7 py-3 shadow-xl shadow-[var(--primary)]/10">
                Sign In
              </Link>
            )}

            {/* Wishlist — only for non-admin authenticated users */}
            {isAuthenticated && !isAdmin && (
              <button onClick={() => setIsWishlistOpen(true)}
                className="relative w-11 h-11 bg-white text-[var(--text-dark)] rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 hover:text-[var(--accent)] transition-all duration-300">
                <FiHeart size={17} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--accent)] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-cream)]">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {/* Cart — only show for non-admin authenticated users */}
            {isAuthenticated && !isAdmin && (
              <div onClick={() => setIsCartOpen(true)}
                className="relative cursor-pointer hover:scale-110 transition-all duration-300 group">
                <div className="w-11 h-11 bg-[var(--text-dark)] text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-[var(--primary)] transition-colors">
                  <FiShoppingBag size={17} />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--accent)] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-cream)] shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[var(--text-dark)] shadow-sm hover:shadow-lg transition-all">
              {isOpen ? <FiX size={19} /> : <FiMenu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              className="absolute top-20 left-4 right-4 lg:hidden bg-white/95 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/50 p-4"
            >
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.to} onClick={() => setIsOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${location.pathname === link.to ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text-dark)] hover:bg-gray-50 hover:text-[var(--primary)]'}`}>
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-dark)] hover:bg-gray-50 hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                      <FiHome size={14} /> Dashboard
                    </Link>
                    <Link to="/orders" onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-dark)] hover:bg-gray-50 hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                      <FiTruck size={14} /> My Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--accent)] hover:bg-red-50 transition-colors text-left flex items-center gap-2">
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;
