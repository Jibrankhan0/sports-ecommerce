const express = require('express');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user wishlist
router.get('/', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products', 'name price discount_price images rating stock');
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [] });
            await wishlist.save();
        }
        res.json(wishlist.products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add to wishlist
router.post('/', auth, async (req, res) => {
    try {
        const { product_id } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [product_id] });
        } else {
            if (!wishlist.products.includes(product_id)) {
                wishlist.products.push(product_id);
            }
        }
        await wishlist.save();
        res.json({ message: 'Added to wishlist' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
            await wishlist.save();
        }
        res.json({ message: 'Removed from wishlist' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
