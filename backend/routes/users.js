const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

// Update own profile (email/password) — any authenticated user
router.put('/profile', protect, async(req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ success: false, message: 'Email already in use.' });
            user.email = email;
        }
        if (name) user.name = name;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password required.' });
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users
router.get('/', protect, authorize('admin'), async(req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user
router.put('/:id', protect, authorize('admin'), async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user
router.delete('/:id', protect, authorize('admin'), async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;