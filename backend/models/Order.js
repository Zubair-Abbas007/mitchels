const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: { type: Number, required: true, min: 1 },
        price: Number,
        total: Number
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: { type: String, enum: ['cash', 'card', 'jazzcash', 'easypaisa'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    deliveryAddress: {
        street: String,
        city: String,
        notes: String
    },
    specialInstructions: { type: String, default: '' },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    workerAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workerCompletedAt: Date,
    deliveredAt: Date,
    createdAt: { type: Date, default: Date.now }
});

OrderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const count = await this.constructor.countDocuments();
        this.orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);