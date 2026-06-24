import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiStar, FiShoppingBag, FiMessageSquare, FiSend, FiClock, FiHeart, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import CheckoutModal from '../components/CheckoutModal';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productAPI.getById(id);
      setProduct(res.data.data);
    } catch (err) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    setIsCheckoutOpen(true);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await productAPI.addComment(id, { text: newComment, rating });
      setProduct({ ...product, comments: res.data.data });
      setNewComment('');
      setRating(5);
      toast.success('Review posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-cream)]">
        <h2 className="serif text-3xl mb-4 text-[var(--text-dark)]">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pt-32 pb-20">

      {/* Back Button — fixed top left, always visible and clickable */}
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/products')}
        className="fixed top-24 left-4 sm:left-6 z-50 flex items-center gap-2 bg-white text-[var(--text-dark)] hover:text-[var(--primary)] hover:shadow-lg transition-all px-4 py-2.5 rounded-full shadow-md border border-gray-100 text-xs font-black uppercase tracking-widest group"
      >
        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="container mx-auto px-6 max-w-4xl">

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-xl border border-gray-100/50 overflow-hidden mb-8"
        >
          {/* Top Section: Image + Info */}
          <div className="p-8 md:p-12">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              
              {/* Small Circle Image */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="relative">
                  <div className="w-36 h-36 rounded-full overflow-hidden ring-8 ring-[var(--bg-cream)] shadow-2xl border-4 border-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  {/* Verified badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 shadow-lg">
                    <FiCheckCircle size={10} /> Premium
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                {/* Category + Rating Row */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-black uppercase tracking-widest">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <FiStar className="fill-current text-yellow-500" size={12} />
                    <span className="text-[11px] font-black text-yellow-700">{product.rating}</span>
                    <span className="text-[9px] text-gray-400 ml-1">({product.comments?.length || 0} reviews)</span>
                  </div>
                </div>

                <h1 className="serif text-3xl md:text-4xl text-[var(--text-dark)] mb-3 leading-tight">
                  {product.name}
                </h1>

                <p className="text-gray-500 text-sm leading-relaxed mb-5 italic">
                  {product.description}
                </p>

                {/* Ingredients */}
                {product.ingredients?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5 justify-center sm:justify-start">
                    {product.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-500 font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-50 mt-8 pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Price */}
                <div className="text-center sm:text-left">
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Price</p>
                  <span className="text-4xl sm:text-5xl font-black text-[var(--text-dark)]">
                    RS <span className="text-[var(--primary)]">{product.price}</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { toggleWishlist(product); }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border self-center sm:self-auto ${isWishlisted(product._id) ? 'bg-red-500 text-white border-red-500 shadow-red-500/25' : 'bg-white text-gray-300 border-gray-100 hover:text-red-400 hover:border-red-100'}`}
                  >
                    <FiHeart className={isWishlisted(product._id) ? 'fill-current' : ''} size={22} />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-50 text-[var(--text-dark)] font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all duration-300"
                  >
                    <FiShoppingBag size={18} /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-dark)] shadow-xl shadow-[var(--primary)]/20 transition-all duration-300 active:scale-95"
                  >
                    Buy Now <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] shadow-xl border border-gray-100/50 p-8 md:p-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="serif text-2xl text-[var(--text-dark)]">Guest Experiences</h2>
            <span className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-400">
              {product.comments?.length || 0} Reviews
            </span>
          </div>

          {/* Comment Form */}
          {user ? (
            <div className="bg-[var(--bg-cream)] rounded-[28px] p-6 mb-8">
              <form onSubmit={handleSubmitComment}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-dark)]">{user.name}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Write a review</p>
                  </div>
                </div>

                {/* Star Rating Picker */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest mr-2">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-all duration-200 hover:scale-125 ${star <= rating ? 'text-yellow-500' : 'text-gray-200'}`}
                    >
                      <FiStar className={star <= rating ? 'fill-current' : ''} size={20} />
                    </button>
                  ))}
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with Mitchells..."
                  className="w-full min-h-[100px] bg-white rounded-2xl px-5 py-4 text-sm text-gray-700 border border-gray-100 focus:ring-2 focus:ring-[var(--primary)]/20 outline-none mb-4 resize-none"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--primary)] text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Review'} <FiSend size={14} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center p-10 bg-[var(--bg-cream)] rounded-[28px] mb-8 border-2 border-dashed border-gray-200">
              <FiMessageSquare className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500 text-sm italic mb-4">Sign in to share your experience</p>
              <button onClick={() => navigate('/login')} className="text-[var(--primary)] font-black text-xs uppercase tracking-widest hover:underline">
                Login
              </button>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-4">
            <AnimatePresence>
              {product.comments?.length > 0 ? (
                product.comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 rounded-[24px] bg-[var(--bg-cream)] border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-sm">
                          {comment.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-black text-sm text-[var(--text-dark)]">{comment.userName}</p>
                          <div className="flex text-yellow-500 mt-0.5 gap-0.5">
                            {[...Array(Math.min(comment.rating || 5, 5))].map((_, i) => (
                              <FiStar key={i} size={11} className="fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <FiClock size={10} /> {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic border-l-2 border-[var(--primary)]/20 pl-4">
                      "{comment.text}"
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiMessageSquare className="mx-auto text-gray-200 mb-3" size={40} />
                  <p className="text-gray-400 text-sm italic">No reviews yet. Be the first to share!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};

export default ProductDetail;
