const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    discount: { type: Number, default: 30 }, // percentage
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
});

CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Coupon', CouponSchema);
