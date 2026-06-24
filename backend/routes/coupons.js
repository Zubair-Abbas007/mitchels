const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Generate a unique coupon code
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MITCH-';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

// POST /api/coupons/generate — generate coupon for email (one per email)
router.post('/generate', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        // Check if this email already has an unused, unexpired coupon
        const existing = await Coupon.findOne({ email, used: false, expiresAt: { $gt: new Date() } });
        if (existing) {
            return res.json({ success: true, code: existing.code, discount: existing.discount, alreadyHad: true });
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        await Coupon.create({ code, email, discount: 30, expiresAt });

        res.json({ success: true, code, discount: 30, expiresAt });
    } catch (error) {
        console.error('❌ Coupon generate error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate coupon.' });
    }
});

// POST /api/coupons/validate — validate coupon at checkout
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
        if (coupon.used) return res.status(400).json({ success: false, message: 'Coupon already used.' });
        if (coupon.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired.' });

        res.json({ success: true, discount: coupon.discount, code: coupon.code });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
    }
});

// POST /api/coupons/redeem — mark coupon as used after order placed
router.post('/redeem', async (req, res) => {
    try {
        const { code } = req.body;
        await Coupon.findOneAndUpdate({ code: code.toUpperCase().trim() }, { used: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to redeem coupon.' });
    }
});

module.exports = router;
