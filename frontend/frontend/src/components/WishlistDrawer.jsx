import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiShoppingBag, FiTrash2, FiArrowRight, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CARD_COLORS = [
  { bg: '#e8524a', light: '#f07068' },
  { bg: '#f07c2a', light: '#f59040' },
  { bg: '#5cb85c', light: '#72cc72' },
  { bg: '#6c63ff', light: '#8b83ff' },
  { bg: '#3e6553', light: '#5a8f74' },
  { bg: '#e8524a', light: '#f07068' },
];

const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleProductClick = (id) => {
    onClose();
    navigate(`/products/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full flex flex-col overflow-hidden"
            style={{ maxWidth: '600px', height: '85vh', borderRadius: '28px', background: 'var(--bg-cream)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 px-6 pt-5 pb-4 flex items-center justify-between bg-white"
              style={{ borderRadius: '28px 28px 0 0' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <FiHeart size={16} className="text-[var(--accent)] fill-current" />
                </div>
                <div>
                  <h2 className="font-black text-[var(--text-dark)] text-base leading-none">Wishlist</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
                <FiX size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-inner">
                    <FiHeart size={30} className="text-gray-200" />
                  </div>
                  <p className="font-black text-gray-400 text-sm mb-1">Nothing saved yet</p>
                  <p className="text-gray-300 text-xs mb-6">Tap ♥ on any product to save it here</p>
                  <button onClick={() => { onClose(); navigate('/products'); }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all">
                    Browse Products <FiArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 content-start pt-2">
                  <AnimatePresence>
                    {wishlist.map((product, i) => {
                      const color = CARD_COLORS[i % CARD_COLORS.length];
                      return (
                        <motion.div key={product._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative flex flex-col cursor-pointer"
                          style={{ borderRadius: '16px', width: '160px' }}
                        >
                          {/* Circle image */}
                          <div className="relative z-10 flex justify-center" style={{ marginBottom: '-28px' }}>
                            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg"
                              style={{ border: `3px solid ${color.bg}` }}
                              onClick={() => handleProductClick(product._id)}>
                              <img src={product.image} alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }} />
                            </div>
                          </div>

                          {/* Card body */}
                          <div className="rounded-[16px] pt-9 pb-4 px-3 flex flex-col"
                            style={{ background: `linear-gradient(160deg, ${color.bg} 0%, ${color.light} 100%)` }}>

                            <button onClick={() => toggleWishlist(product)}
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all">
                              <FiX size={9} className="text-white" />
                            </button>

                            <h3 className="font-black text-white text-[10px] leading-tight mb-2.5 line-clamp-2 text-center"
                              onClick={() => handleProductClick(product._id)}>
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-white text-xs">RS {product.price}</span>
                              <button onClick={() => addToCart(product, 1)}
                                className="flex items-center gap-0.5 bg-white text-gray-700 text-[8px] font-black uppercase px-2 py-1 rounded-full hover:bg-gray-50 transition-all shadow-sm">
                                <FiShoppingBag size={8} /> Add
                              </button>
                            </div>

                            <div className="flex items-center justify-center gap-0.5">
                              <FiStar size={8} className="fill-current text-yellow-300" />
                              <span className="text-white text-[8px] font-black">{product.rating || '5.0'}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
