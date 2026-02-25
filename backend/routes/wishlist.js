const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user wishlist
router.get('/', auth, async (req, res) => {
    try {
        const [items] = await pool.query(
            `SELECT w.id, p.id as product_id, p.name, p.price, p.discount_price, p.images, p.rating, p.stock, c.name as category
       FROM wishlist w JOIN products p ON w.product_id=p.id LEFT JOIN categories c ON p.category_id=c.id
       WHERE w.user_id=?`,
            [req.user.id]
        );
        res.json(items.map(i => ({ ...i, images: parseImages(i.images) })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add to wishlist
router.post('/', auth, async (req, res) => {
    try {
        const { product_id } = req.body;
        await pool.query('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
        res.json({ message: 'Added to wishlist' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlist WHERE user_id=? AND product_id=?', [req.user.id, req.params.productId]);
        res.json({ message: 'Removed from wishlist' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

function parseImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
}

module.exports = router;
