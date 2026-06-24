const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../config/email');

// Get all orders
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ?
            Order.find().populate('user', 'name email').sort('-createdAt') :
            Order.find({ user: req.user.id }).sort('-createdAt');

        const orders = await query;
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create order
router.post('/', protect, async (req, res) => {
    try {
        let totalAmount = 0;
        const items = req.body.items || [];

        for (let item of items) {
            item.total = item.quantity * item.price;
            totalAmount += item.total;
        }

        const order = await Order.create({
            ...req.body,
            user: req.user.id,
            totalAmount,
            status: 'pending'
        });

        const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
        try {
            await sendOrderConfirmation(populatedOrder, populatedOrder.user);
        } catch (emailErr) {
            console.warn('⚠️ Order confirmation email failed (non-critical):', emailErr.message);
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.status = req.body.status;
        if (req.body.status === 'confirmed') order.paymentStatus = 'paid';

        await order.save();
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Worker complete order
router.put('/:id/worker-complete', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.workerAssigned = req.user.id;
        order.workerCompletedAt = new Date();
        order.status = 'ready';
        await order.save();

        res.json({ success: true, data: order, message: 'Order marked as ready by worker' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete order
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        await order.deleteOne();
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get order stats
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const preparingOrders = await Order.countDocuments({ status: 'preparing' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        const revenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user', 'name');

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                preparingOrders,
                completedOrders,
                totalRevenue: revenue[0]?.total || 0,  // ✅ fixed optional chaining
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;