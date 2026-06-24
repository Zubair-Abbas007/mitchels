import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiRefreshCw, 
  FiPackage, FiTag, FiX, FiSave, FiShoppingBag, FiInfo, FiArrowRight, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';

/* ── Products grouped by category ── */
const ProductsByCategory = ({ products, openModal, handleDelete }) => {
  const grouped = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-black text-[var(--text-dark)] text-base">{cat}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">{items.length}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((product, index) => (
              <motion.div key={product._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400'}
                    alt={product.name} className="w-full h-full object-cover" />
                  {!product.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Out</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-black text-gray-800 text-xs leading-tight line-clamp-1 mb-0.5">{product.name}</p>
                  <p className="font-black text-[var(--primary)] text-sm mb-2">RS {product.price?.toLocaleString()}</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => openModal(product)}
                      className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-100 transition text-[10px] font-black">
                      <FiEdit2 size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-50 text-red-500 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-red-100 transition text-[10px] font-black">
                      <FiTrash2 size={11} /> Del
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'jams',
    ingredients: [],
    isAvailable: true,
    image: ''
  });
  const [ingredientInput, setIngredientInput] = useState('');

  const categories = [
    { id: 'jams', name: 'Premium Jams' },
    { id: 'sauces', name: 'Table Sauces' },
    { id: 'chutneys', name: 'Exotic Chutneys' },
    { id: 'pickles', name: 'Traditional Pickles' },
    { id: 'ready-to-eat', name: 'Ready-to-Eat' },
    { id: 'sweets', name: 'Gourmet Sweets' },
    { id: 'gourmet', name: 'Chef Special' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAdmin();
      setProducts(res.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load curation');
    } finally {
      setLoading(false);
    }
  };

  const initializeProducts = async () => {
    setLoading(true);
    try {
      await productAPI.init();
      toast.success('Gourmet Catalog Initialized');
      fetchProducts();
    } catch (error) {
      toast.error('Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        toast.success('Collection Item Updated');
      } else {
        await productAPI.create(formData);
        toast.success('New Masterpiece Added');
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this item from the gourmet collection?')) {
      try {
        await productAPI.delete(id);
        toast.success('Item Removed');
        fetchProducts();
      } catch (error) {
        toast.error('Removal failed');
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        ingredients: product.ingredients || [],
        isAvailable: product.isAvailable,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'jams',
        ingredients: [],
        isAvailable: true,
        image: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()]
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-cream)] pb-6">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
             <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[2px] bg-[var(--primary)]"></span>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--primary)]">Admin Curatorial Suite</p>
             </div>
             <h1 className="serif text-3xl sm:text-5xl text-[var(--text-dark)] leading-tight">Manage Collection</h1>
             <p className="text-[var(--text-muted)] mt-2 italic">Optimizing Mitchells' 21-item premium catalog.</p>
          </motion.div>
          
          <div className="flex gap-4">
            <button
              onClick={initializeProducts}
              className="bg-white text-[10px] uppercase font-black tracking-widest px-6 py-4 rounded-full border border-gray-100 shadow-sm hover:shadow-lg transition flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Reset Catalog
            </button>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus /> Add Product
            </button>
          </div>
        </div>

        {/* Content Area */}
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-[32px] p-16 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FiPackage size={28} />
            </div>
            <h3 className="font-black text-gray-400 text-base mb-2">Catalog is empty</h3>
            <p className="text-gray-300 text-sm mb-6">Click Reset Catalog to initialize products.</p>
            <button onClick={initializeProducts}
              className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-dark)] transition-all">
              Initialize Catalog
            </button>
          </motion.div>
        ) : (
          <ProductsByCategory products={products} openModal={openModal} handleDelete={handleDelete} />
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-cream)] rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/50"
            >
              <div className="bg-[var(--primary)] p-8 flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 -translate-y-16"></div>
                 <h2 className="serif text-2xl text-white relative z-10 flex items-center gap-3">
                   {editingProduct ? <FiEdit2 /> : <FiPlus />} {editingProduct ? 'Refine Masterpiece' : 'Add to Collection'}
                 </h2>
                 <button onClick={closeModal} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all relative z-10">
                   <FiX size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Product Identity</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-bold text-sm"
                        placeholder="Ex: Mango Chutney Heritage"
                        required
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Investment (RS)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-black text-sm"
                        placeholder="950"
                        required
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Visual Essence (URL)</label>
                   <input
                     type="text"
                     value={formData.image}
                     onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                     className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all italic text-sm"
                     placeholder="https://images.unsplash.com/..."
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Curated Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all font-black text-sm uppercase tracking-widest appearance-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                   </div>
                   <div className="space-y-4 flex flex-col pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${formData.isAvailable ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-gray-100 bg-white shadow-inner'}`}>
                           {formData.isAvailable && <FiSave size={14} />}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="hidden"
                        />
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-[var(--primary)] transition-colors">Available in Curation</span>
                      </label>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Gourmet Narrative (Description)</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-[32px] bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all italic text-sm"
                    placeholder="Describe the exquisite flavors..."
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">Ingredients Selection</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      placeholder="Add an ingredient token"
                      className="flex-1 px-6 py-4 rounded-2xl bg-white border-2 border-gray-50 outline-none focus:border-[var(--primary)]/20 transition-all text-sm italic"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[var(--primary)]/20"
                    >
                      Tokenize
                    </button>
                  </div>
                  {/* Quick-add ingredient suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Sugar','Salt','Vinegar','Garlic','Ginger','Lemon Juice','Mustard Oil',
                      'Red Chilli','Cumin','Coriander','Turmeric','Cardamom','Cinnamon',
                      'Mango Pulp','Tomato Puree','Olive Oil','Pectin','Citric Acid',
                      'Fresh Mint','Tamarind','Coconut','Soy Sauce','Honey','Paprika'
                    ].filter(s => !formData.ingredients.includes(s))
                     .map(suggestion => (
                      <button key={suggestion} type="button"
                        onClick={() => setFormData(f => ({ ...f, ingredients: [...f.ingredients, suggestion] }))}
                        className="px-3 py-1.5 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                  {formData.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 p-4 rounded-3xl bg-white/50 border border-white">
                      {formData.ingredients.map((ing, i) => (
                        <span key={i} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm border border-gray-50">
                          {ing}
                          <button type="button" onClick={() => removeIngredient(i)} className="text-[var(--accent)] hover:scale-125 transition-transform">
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-6 rounded-[32px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl shadow-[var(--primary)]/20 hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>{editingProduct ? 'Refine Masterwork' : 'Finalize Masterpiece'} <FiArrowRight /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProducts;