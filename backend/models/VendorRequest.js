const mongoose = require('mongoose');

const VendorRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    productCategories: { type: String, required: true },
    estimatedMonthlyOrder: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    additionalNotes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    adminNote: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorRequest', VendorRequestSchema);
