const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

function genOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Place order
router.post('/', auth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { customer_name, customer_email, customer_phone, shipping_address, city, items, notes } = req.body;
        if (!items || !items.length) return res.status(400).json({ message: 'No items in order' });
        const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const orderNumber = genOrderNumber();
        const [result] = await conn.query(
            'INSERT INTO orders (user_id, order_number, customer_name, customer_email, customer_phone, shipping_address, city, total, notes) VALUES (?,?,?,?,?,?,?,?,?)',
            [req.user.id, orderNumber, customer_name, customer_email, customer_phone, shipping_address, city, total, notes]
        );
        const orderId = result.insertId;
        for (const item of items) {
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES (?,?,?,?,?,?)',
                [orderId, item.product_id, item.product_name, item.product_image, item.price, item.quantity]
            );
            await conn.query('UPDATE products SET stock=stock-?, sold_count=sold_count+? WHERE id=?', [item.quantity, item.quantity, item.product_id]);
        }
        await conn.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);
        await conn.commit();
        res.status(201).json({ message: 'Order placed successfully', orderNumber, orderId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

// Get user's orders
router.get('/my', auth, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
        const result = [];
        for (const order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
            result.push({ ...order, items });
        }
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!orders.length) return res.status(404).json({ message: 'Order not found' });
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [req.params.id]);
        res.json({ ...orders[0], items });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
