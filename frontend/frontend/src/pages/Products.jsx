import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import CartModal from '../components/CartModal';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingBag, FiX } from 'react-icons/fi';

// ── Menu Card — matches reference image style ──
const MenuCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="block">
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.22 }}
        className="relative bg-white rounded-[22px] overflow-hidden shadow-sm border border-gray-100"
        style={{ minWidth: 0 }}
      >
        {/* Top: image area with light gray background */}
        <div
          className="relative flex items-center justify-center bg-[#f0f0ee]"
          style={{ height: '160px' }}
        >
          {/* Large circular plate image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-32 h-32 rounded-full object-cover"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop';
            }}
          />

          {/* Cart button — dark, top-right */}
          <button
            onClick={handleCart}
            className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
            style={{ backgroundColor: '#1a1a1a', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            <FiShoppingBag size={16} />
          </button>
        </div>

        {/* Bottom: info section */}
        <div className="px-4 pt-3 pb-4">
          <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mb-3 line-clamp-1">
            {product.description}
          </p>
          <p className="text-base font-black text-gray-900">
            RS {product.price}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

// ── Category icons ──
const categoryMeta = {
  'Jams':        { icon: '🍓', desc: 'Handcrafted fruit preserves' },
  'Sauces':      { icon: '🌶️', desc: 'Bold & vibrant condiments' },
  'Chutneys':    { icon: '🍯', desc: 'Traditional dipping sauces' },
  'Pickles':     { icon: '🥒', desc: 'Tangy preserved favourites' },
  'Ready to Eat':{ icon: '🍲', desc: 'Just heat and savour' },
  'Sweets':      { icon: '🍮', desc: 'Pure indulgence in every bite' },
  'Gourmet':     { icon: '✨', desc: 'Fine artisan selections' },
};

// ── Main Page ──
const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Apply category from footer navigation state
    if (location.state?.category) {
      setActiveCategory(location.state.category);
      window.history.replaceState({}, ''); // clear state so refresh doesn't re-apply
    }
  }, [location.state]);

  useEffect(() => {
    document.title = 'Mitchells Menu — Premium Selection';
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter & group by category — case-insensitive matching
  const filtered = products.filter(p => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    const matchCat = activeCategory === 'all' ||
      p.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  // Group filtered products by category, preserving order
  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const categoryFilters = [
    { value: 'all', label: 'All Items', icon: '🧺' },
    ...Object.keys(categoryMeta).map(k => ({ value: k, label: k, icon: categoryMeta[k].icon }))
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-32">
      <div className="container mx-auto px-4 sm:px-6 pb-16">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)] mb-3">Mitchells Gourmet</p>
          <h1 className="serif text-4xl sm:text-5xl md:text-6xl text-[var(--text-dark)] mb-4">Our Menu</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Explore our curated selection of premium products. From famous jams to exotic gourmet finds — every item is an experience.
          </p>
        </motion.div>

        {/* ── Search & Category Filter ── */}
        <div className="bg-white rounded-[32px] p-5 mb-14 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, category or ingredient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-12 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[var(--primary)] text-sm text-gray-800 placeholder-gray-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:pb-0 flex-nowrap">
              {categoryFilters.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setActiveCategory(cat.value); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.value
                      ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── No Results ── */}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100">
            <span className="text-6xl block mb-6">🔍</span>
            <h3 className="serif text-2xl text-[var(--text-dark)] mb-2">Nothing found</h3>
            <p className="text-gray-500 mb-8 text-sm">Try a different search or category.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="btn-primary"
            >
              Show All
            </button>
          </div>
        )}

        {/* ── Categories with Grid ── */}
        <div className="space-y-14">
          {Object.entries(grouped).map(([cat, items], catIndex) => {
            const meta = categoryMeta[cat] || { icon: '🍽️', desc: '' };
            return (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.08 }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <h2 className="serif text-2xl text-[var(--text-dark)]">{cat}</h2>
                      <p className="text-gray-400 text-xs italic">{meta.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] border border-[var(--primary)]/20 px-3 py-1 rounded-full bg-[var(--primary)]/5">
                    {items.length} items
                  </span>
                </div>

                {/* Centered product grid */}
                <div className="flex flex-wrap justify-center gap-5">
                  {items.map((product) => (
                    <div key={product._id} className="w-[160px] sm:w-[200px]">
                      <MenuCard product={product} />
                    </div>
                  ))}
                </div>

                <div className="mt-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </motion.section>
            );
          })}
        </div>
      </div>

      <Footer />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};

export default Products;