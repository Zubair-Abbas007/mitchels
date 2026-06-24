const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// GET /api/wishlist — get user's wishlist
router.get('/', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
        res.json({ success: true, data: wishlist?.products || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/wishlist/:productId — toggle product in wishlist
router.post('/:productId', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [] });
        }

        const productId = req.params.productId;
        const index = wishlist.products.indexOf(productId);
        let added;

        if (index === -1) {
            wishlist.products.push(productId);
            added = true;
        } else {
            wishlist.products.splice(index, 1);
            added = false;
        }

        await wishlist.save();
        res.json({ success: true, added, data: wishlist.products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
