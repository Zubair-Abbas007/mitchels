const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Default Products Data (Truncated to exactly 3 per category)
const defaultProducts = [
    // === JAMS (5) ===
    {
        name: "Premium Mixed Fruit Jam",
        description: "A rich, vibrant blend of fresh seasonal fruits, perfectly preserved to capture nature's essence.",
        price: 350,
        category: "Jams",
        image: "https://images.unsplash.com/photo-1543158181-e6f9f670c5b5?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Mixed Fruit Pulp", "Sugar", "Pectin", "Natural Flavors"],
        rating: 4.9
    },
    {
        name: "Classic Apple Jam",
        description: "Smooth and sweet apple jam made from hand-picked orchard apples. A timeless tradition since 1933.",
        price: 320,
        category: "Jams",
        image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Gala Apples", "Sugar", "Lemon Juice", "Cinnamon Tint"],
        rating: 4.8
    },
    {
        name: "Golden Mango Jam",
        description: "Exotic and sweet mango jam made from premium chaunsa mangoes. A tropical delight in every spoonful.",
        price: 380,
        category: "Jams",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Mango Pulp", "Sugar", "Pectin", "Citric Acid"],
        rating: 4.9
    },
    {
        name: "Strawberry Jam",
        description: "Bright and fruity strawberry jam bursting with fresh berry flavour. Perfect on toast or pastries.",
        price: 340,
        category: "Jams",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Fresh Strawberries", "Sugar", "Lemon Juice", "Pectin"],
        rating: 4.8
    },
    {
        name: "Apricot Preserve",
        description: "Sun-ripened apricots slow-cooked into a velvety preserve with a delicate floral sweetness.",
        price: 360,
        category: "Jams",
        image: "https://images.unsplash.com/photo-1597714026720-8f74c62310ba?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Apricots", "Sugar", "Vanilla", "Citric Acid"],
        rating: 4.7
    },

    // === SAUCES (5) ===
    {
        name: "Mitchells Chilli Sauce",
        description: "Our signature extra-spicy chilli sauce. Made with premium red chillies to give your meals a powerful kick.",
        price: 180,
        category: "Sauces",
        image: "https://images.unsplash.com/photo-1581448670522-ee19da70a442?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Red Chillies", "Garlic", "Vinegar", "Paprika", "Spices"],
        rating: 4.9
    },
    {
        name: "Chilli Garlic Sauce",
        description: "The perfect fusion of garlic and red chillies. Adds depth and fire to your favorite dips and snacks.",
        price: 195,
        category: "Sauces",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Garlic", "Red Chillies", "Sugar", "Salt", "Stabilizers"],
        rating: 4.8
    },
    {
        name: "Tomato Ketchup",
        description: "Thick and rich tomato ketchup made from sun-ripened tomatoes. The essential condiment for every table.",
        price: 160,
        category: "Sauces",
        image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dc4a7?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Tomato Puree", "Vinegar", "Sugar", "Onion Powder", "Spices"],
        rating: 4.7
    },
    {
        name: "BBQ Sauce",
        description: "Smoky and tangy BBQ sauce with a hint of sweetness. Ideal for grilling and dipping.",
        price: 210,
        category: "Sauces",
        image: "https://images.unsplash.com/photo-1558818498-28c1e002b655?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Tomatoes", "Molasses", "Vinegar", "Smoked Paprika", "Garlic"],
        rating: 4.8
    },
    {
        name: "Soy Ginger Sauce",
        description: "A bold Asian-inspired sauce with soy and fresh ginger. Great for stir-fries and marinades.",
        price: 225,
        category: "Sauces",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Soy Sauce", "Fresh Ginger", "Garlic", "Sesame Oil", "Honey"],
        rating: 4.7
    },

    // === CHUTNEYS (5) ===
    {
        name: "Special Mango Chatni",
        description: "Authentic Sweet Mango Chutney. Perfectly balanced and traditional.",
        price: 280,
        category: "Chutneys",
        image: "https://images.unsplash.com/photo-1542361345-89e58247f2d2?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Mango", "Sugar", "Vinegar", "Spices"],
        rating: 4.8
    },
    {
        name: "Mint & Coriander Chutney",
        description: "Fresh and cooling mint chutney. The perfect dip for appetizers.",
        price: 150,
        category: "Chutneys",
        image: "https://images.unsplash.com/photo-1589670307596-a176755a7582?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Fresh Mint", "Coriander", "Green Chilli", "Lemon"],
        rating: 4.9
    },
    {
        name: "Tamarind (Imli) Dip",
        description: "Tangy and sweet tamarind sauce. Essential for snacks and chaat.",
        price: 190,
        category: "Chutneys",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Tamarind", "Jaggary", "Cumin", "Ginger Powder"],
        rating: 4.8
    },
    {
        name: "Plum Chutney",
        description: "Rich and fruity plum chutney with warm spices. A classic accompaniment to cheese and meats.",
        price: 260,
        category: "Chutneys",
        image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Plums", "Brown Sugar", "Cinnamon", "Cloves", "Vinegar"],
        rating: 4.7
    },
    {
        name: "Coconut Chutney",
        description: "Creamy and aromatic coconut chutney with curry leaves. A South Asian classic.",
        price: 175,
        category: "Chutneys",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Coconut", "Green Chilli", "Curry Leaves", "Mustard Seeds"],
        rating: 4.8
    },

    // === PICKLES (5) ===
    {
        name: "Mixed Pickle (Traditional)",
        description: "Spicy mixed pickle cured in premium mustard oil.",
        price: 260,
        category: "Pickles",
        image: "https://images.unsplash.com/photo-1589135340809-51f7dcf48633?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Mango", "Carrot", "Lemon", "Mustard Oil"],
        rating: 4.9
    },
    {
        name: "Spicy Mango Pickle",
        description: "Pure mango Achar with the intense heat of traditional spices.",
        price: 250,
        category: "Pickles",
        image: "https://images.unsplash.com/photo-1589135340809-51f7dcf48633?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Cut Mango", "Mustard Oil", "Fennel Seeds", "Red Chilli"],
        rating: 4.8
    },
    {
        name: "Tangy Lemon Pickle",
        description: "Sour and spicy lemon wedges. A classic accompaniment.",
        price: 240,
        category: "Pickles",
        image: "https://images.unsplash.com/photo-1589135340809-51f7dcf48633?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Lemon", "Salt", "Turmeric", "Green Chilli"],
        rating: 4.7
    },
    {
        name: "Garlic Pickle",
        description: "Bold and pungent garlic pickle aged in spiced oil. A flavour powerhouse.",
        price: 270,
        category: "Pickles",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Garlic Cloves", "Mustard Oil", "Red Chilli", "Fenugreek"],
        rating: 4.8
    },
    {
        name: "Green Chilli Pickle",
        description: "Fiery whole green chillies pickled in aromatic spices. For the bold palate.",
        price: 230,
        category: "Pickles",
        image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Green Chillies", "Mustard Seeds", "Turmeric", "Salt", "Oil"],
        rating: 4.7
    },

    // === READY TO EAT (5) ===
    {
        name: "Biryani Masala",
        description: "Authentic blend of whole spices for the perfect biryani. Rich, aromatic and balanced.",
        price: 120,
        category: "Ready to Eat",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Cumin", "Coriander", "Cardamom", "Cinnamon", "Bay Leaves", "Star Anise"],
        rating: 4.9
    },
    {
        name: "Korma Masala",
        description: "Creamy and mildly spiced korma blend. Perfect for chicken, mutton or vegetable korma.",
        price: 110,
        category: "Ready to Eat",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Coriander", "Cumin", "Cardamom", "Poppy Seeds", "Coconut Powder", "Turmeric"],
        rating: 4.8
    },
    {
        name: "Karahi Masala",
        description: "Bold and fiery karahi spice mix. Brings the authentic dhaba flavour to your kitchen.",
        price: 115,
        category: "Ready to Eat",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Red Chilli", "Coriander", "Cumin", "Black Pepper", "Ginger Powder", "Garlic"],
        rating: 4.9
    },
    {
        name: "Nihari Masala",
        description: "Traditional slow-cook spice blend for nihari. Deep, warming and full of flavour.",
        price: 130,
        category: "Ready to Eat",
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Fennel", "Coriander", "Cumin", "Nutmeg", "Mace", "Dried Ginger"],
        rating: 4.8
    },
    {
        name: "Haleem Masala",
        description: "Complete spice kit for slow-cooked haleem. Earthy, rich and deeply satisfying.",
        price: 125,
        category: "Ready to Eat",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Coriander", "Cumin", "Turmeric", "Red Chilli", "Garam Masala", "Dried Mint"],
        rating: 4.7
    },

    // === SWEETS (5) ===
    {
        name: "Jubilee Gold Sweets",
        description: "Exquisite traditional sweets with pure desi ghee.",
        price: 550,
        category: "Sweets",
        image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Desi Ghee", "Condensed Milk", "Nuts"],
        rating: 5.0
    },
    {
        name: "Gajar Ka Halwa",
        description: "Rich carrot sweet with khoya and dry fruits.",
        price: 450,
        category: "Sweets",
        image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Red Carrot", "Milk", "Khoya", "Desi Ghee"],
        rating: 4.9
    },
    {
        name: "Canned Gulab Jamun",
        description: "Soft milk dumplings in sugar syrup.",
        price: 380,
        category: "Sweets",
        image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Milk Solids", "Sugar Syrup", "Cardamom"],
        rating: 4.8
    },
    {
        name: "Kheer",
        description: "Creamy rice pudding with saffron and pistachios. A festive favourite.",
        price: 320,
        category: "Sweets",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Rice", "Full Cream Milk", "Sugar", "Saffron", "Pistachios"],
        rating: 4.8
    },
    {
        name: "Barfi (Milk Fudge)",
        description: "Dense and sweet milk fudge topped with silver leaf and cardamom.",
        price: 490,
        category: "Sweets",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Khoya", "Sugar", "Cardamom", "Silver Leaf"],
        rating: 4.9
    },

    // === GOURMET (5) ===
    {
        name: "Pickled Asparagus",
        description: "Crunchy asparagus spears preserved for fine dining.",
        price: 850,
        category: "Gourmet",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Asparagus", "Salt", "Dill Seeds", "Vinegar"],
        rating: 4.9
    },
    {
        name: "Sun-dried Tomatoes",
        description: "Rich and chewy tomatoes dried under the Mediterranean sun.",
        price: 680,
        category: "Gourmet",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Tomatoes", "Salt", "Oregano", "Oil"],
        rating: 4.9
    },
    {
        name: "Artichoke Hearts",
        description: "Tender artichoke hearts in aromatic olive oil.",
        price: 920,
        category: "Gourmet",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Artichoke", "Extra Virgin Olive Oil", "Garlic"],
        rating: 4.8
    },
    {
        name: "Truffle Infused Oil",
        description: "Premium extra virgin olive oil infused with black truffle. Elevates any dish instantly.",
        price: 1200,
        category: "Gourmet",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Extra Virgin Olive Oil", "Black Truffle", "Sea Salt"],
        rating: 5.0
    },
    {
        name: "Roasted Red Peppers",
        description: "Flame-roasted sweet red peppers in herb-infused oil. A gourmet pantry essential.",
        price: 760,
        category: "Gourmet",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800",
        ingredients: ["Red Bell Peppers", "Olive Oil", "Garlic", "Thyme"],
        rating: 4.8
    }
];

// GET Latest Reviews across all products
router.get('/reviews/latest', async(req, res) => {
    try {
        const products = await Product.find({ 'comments.0': { $exists: true } }, 'name comments').lean();
        const allReviews = [];
        products.forEach(p => {
            p.comments.forEach(c => {
                allReviews.push({
                    productName: p.name,
                    userName: c.userName,
                    text: c.text,
                    rating: c.rating,
                    createdAt: c.createdAt
                });
            });
        });
        // Sort by newest, return top 6
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ success: true, data: allReviews.slice(0, 6) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Initialize products
router.post('/init', protect, authorize('admin'), async(req, res) => {
    try {
        await Product.deleteMany({});
        const products = await Product.insertMany(defaultProducts);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async(req, res) => {
    try {
        const products = await Product.find({ isAvailable: true }).sort({ category: 1, name: 1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin routes (Must be before /:id)
router.get('/admin', protect, authorize('admin'), async(req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Single Product
router.get('/:id', async(req, res) => {
    try {
        console.log(`🔍 Product Retrieval Request: ${req.params.id}`);
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.warn(`⚠️ Product Not Found: ${req.params.id}`);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error(`❌ Product Retrieval Error for ${req.params.id}:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST Comment to Product
router.post('/:id/comment', protect, async(req, res) => {
    try {
        const { text, rating } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const newComment = {
            user: req.user.id,
            userName: req.user.name,
            text,
            rating: Number(rating) || 5,
            createdAt: new Date()
        };

        product.comments.push(newComment);
        await product.save();

        res.json({ success: true, data: product.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reordered to avoid collision

router.post('/', protect, authorize('admin'), async(req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id', protect, authorize('admin'), async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', protect, authorize('admin'), async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;