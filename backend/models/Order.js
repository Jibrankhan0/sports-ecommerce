const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order_number: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String },
    shipping_address: { type: String, required: true },
    city: { type: String },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: { type: Number, required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        product_name: { type: String, required: true },
        product_image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
