const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get cart
router.get('/', auth, async (req, res) => {
    try {
        const [items] = await pool.query(
            `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.discount_price, p.images, p.stock, cat.name as category
       FROM cart c JOIN products p ON c.product_id=p.id LEFT JOIN categories cat ON p.category_id=cat.id
       WHERE c.user_id=?`,
            [req.user.id]
        );
        res.json(items.map(i => ({ ...i, images: parseImages(i.images) })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add to cart
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        const [existing] = await pool.query('SELECT id, quantity FROM cart WHERE user_id=? AND product_id=?', [req.user.id, product_id]);
        if (existing.length) {
            await pool.query('UPDATE cart SET quantity=quantity+? WHERE id=?', [quantity, existing[0].id]);
        } else {
            await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
        }
        res.json({ message: 'Added to cart' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update quantity
router.put('/:id', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            await pool.query('DELETE FROM cart WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        } else {
            await pool.query('UPDATE cart SET quantity=? WHERE id=? AND user_id=?', [quantity, req.params.id, req.user.id]);
        }
        res.json({ message: 'Cart updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove from cart
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        res.json({ message: 'Removed from cart' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

function parseImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
}

module.exports = router;
