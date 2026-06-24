import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <FiHeart size={22} className="text-[var(--accent)]" />
            <h1 className="serif text-3xl sm:text-4xl text-[var(--text-dark)]">My Wishlist</h1>
          </div>
          <p className="text-[var(--text-muted)] text-sm ml-9">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100">
            <FiHeart size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-black text-gray-400 text-lg mb-2">Your wishlist is empty</h3>
            <p className="text-gray-300 text-sm mb-6">Save products you love to find them easily later.</p>
            <Link to="/products"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all">
              Browse Products <FiArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            <AnimatePresence>
              {wishlist.map((product, i) => (
                <motion.div key={product._id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">

                  {/* Image */}
                  <div className="relative h-32 bg-gray-50 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/products/${product._id}`)}>
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }} />
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-all">
                      <FiTrash2 size={12} className="text-red-400" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-black text-[var(--text-dark)] text-xs mb-0.5 line-clamp-1 cursor-pointer hover:text-[var(--primary)] transition-colors"
                      onClick={() => navigate(`/products/${product._id}`)}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-[var(--primary)] text-sm">RS {product.price}</span>
                      <button onClick={() => addToCart(product, 1)}
                        className="flex items-center gap-1 bg-[var(--primary)] text-white px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all">
                        <FiShoppingBag size={10} /> Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
