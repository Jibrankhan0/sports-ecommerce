const express = require('express');
const Cart = require('../models/Cart');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discount_price images stock');
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
            await cart.save();
        }
        res.json(cart.items);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add to cart
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [{ product: product_id, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(p => p.product.toString() === product_id);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += Number(quantity);
            } else {
                cart.items.push({ product: product_id, quantity });
            }
        }

        await cart.save();
        res.json({ message: 'Added to cart' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update quantity
router.put('/:id', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(p => p.product.toString() === req.params.id);
        if (itemIndex > -1) {
            if (quantity < 1) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = Number(quantity);
            }
            await cart.save();
            res.json({ message: 'Cart updated' });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove from cart
router.delete('/:id', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = cart.items.filter(p => p.product.toString() !== req.params.id);
            await cart.save();
        }
        res.json({ message: 'Removed from cart' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
