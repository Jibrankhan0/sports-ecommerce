const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add review
router.post('/:productId', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating 1-5 required' });

        const review = new Review({
            product: req.params.productId,
            user: req.user.id,
            user_name: req.user.name,
            rating,
            comment
        });
        await review.save();

        // Update product rating and review count
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(req.params.productId, {
                rating: stats[0].avgRating.toFixed(2),
                review_count: stats[0].count
            });
        }

        res.status(201).json({ message: 'Review added' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
