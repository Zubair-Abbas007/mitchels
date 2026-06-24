const express = require('express');
const router = express.Router();
const VendorRequest = require('../models/VendorRequest');
const { protect, authorize } = require('../middleware/auth');
const adminOnly = authorize('admin');

// POST /api/vendor — user submits bulk order request
router.post('/', protect, async (req, res) => {
    try {
        const { companyName, contactPerson, phone, email, productCategories, estimatedMonthlyOrder, deliveryAddress, additionalNotes } = req.body;

        // One pending request per user at a time
        const existing = await VendorRequest.findOne({ user: req.user.id, status: 'pending' });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a pending vendor request.' });
        }

        const request = await VendorRequest.create({
            user: req.user.id,
            companyName, contactPerson, phone, email,
            productCategories, estimatedMonthlyOrder,
            deliveryAddress, additionalNotes
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        console.error('❌ Vendor request error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/vendor/my — get all of current user's requests
router.get('/my', protect, async (req, res) => {
    try {
        const requests = await VendorRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/vendor — admin gets all requests
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const requests = await VendorRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/vendor/:id — admin accept or decline
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const request = await VendorRequest.findByIdAndUpdate(
            req.params.id,
            { status, adminNote: adminNote || '' },
            { new: true }
        ).populate('user', 'name email');

        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
