const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

function genOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Place order
router.post('/', auth, async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, shipping_address, city, items, notes } = req.body;
        if (!items || !items.length) return res.status(400).json({ message: 'No items in order' });

        const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const orderNumber = genOrderNumber();

        const order = new Order({
            user: req.user.id,
            order_number: orderNumber,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            city,
            total,
            notes,
            items: items.map(item => ({
                product: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image,
                price: item.price,
                quantity: item.quantity
            }))
        });

        await order.save();

        // Update stock and sold counts
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product_id, {
                $inc: { stock: -item.quantity, sold_count: item.quantity }
            });
        }

        res.status(201).json({ message: 'Order placed successfully', orderNumber, orderId: order._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's orders
router.get('/my', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
