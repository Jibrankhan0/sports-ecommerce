const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            'SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC',
            [req.params.productId]
        );
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add review
router.post('/:productId', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating 1-5 required' });
        await pool.query(
            'INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?,?,?,?,?)',
            [req.params.productId, req.user.id, req.user.name, rating, comment]
        );
        // Update product rating
        const [result] = await pool.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE product_id=?',
            [req.params.productId]
        );
        await pool.query('UPDATE products SET rating=?, review_count=? WHERE id=?',
            [result[0].avg_rating.toFixed(2), result[0].cnt, req.params.productId]);
        res.status(201).json({ message: 'Review added' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
