import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/products/' + product._id);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <Link to={`/products/${product._id}`} className="block w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[28px] p-6 shadow-sm hover:shadow-2xl hover:shadow-black/8 transition-all duration-500 border border-gray-100/80 relative overflow-hidden group"
      >
        {/* Top subtle accent line */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent rounded-b-full"></div>

        {/* Circle Image + Like Button */}
        <div className="flex items-start justify-between mb-5">
          {/* Circle Image */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[var(--bg-cream)] shadow-xl border-2 border-white">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop";
                }}
              />
            </div>
            {/* Category dot badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--primary)] rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Like + Rating */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleLike}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${liked ? 'bg-red-500 text-white shadow-red-500/25' : 'bg-gray-50 text-gray-300 hover:text-red-400 hover:bg-red-50'}`}
            >
              <FiHeart className={liked ? 'fill-current' : ''} size={16} />
            </button>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
              <FiStar className="fill-current text-yellow-500" size={11} />
              <span className="text-[11px] font-black text-yellow-700">{product.rating}</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-5">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-[var(--primary)] mb-1.5">{product.category}</p>
          <h3 className="serif text-lg text-[var(--text-dark)] leading-tight mb-2 line-clamp-1 group-hover:text-[var(--primary)] transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <p className="text-[8px] text-gray-300 uppercase font-black tracking-widest">Price</p>
            <span className="text-xl font-black text-[var(--text-dark)]">
              RS {product.price}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[var(--primary)] hover:text-white hover:shadow-lg transition-all duration-300"
              title="Add to Cart"
            >
              <FiShoppingBag size={16} />
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-[var(--text-dark)] text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[var(--primary)] active:scale-95 transition-all duration-300 flex items-center gap-1.5"
            >
              Buy <FiArrowRight size={10} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;