const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    specifications: { type: String },
    price: { type: Number, required: true },
    discount_price: { type: Number },
    stock: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
    is_new_arrival: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
