const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const router = express.Router();

// Get all products with filtering, sorting, search, pagination
router.get('/', async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, rating, inStock, sort, search, page = 1, limit = 12 } = req.query;
        let query = {};

        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (cat) query.category = cat._id;
        }
        if (brand) query.brand = brand;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (rating) query.rating = { $gte: Number(rating) };
        if (inStock === 'true') query.stock = { $gt: 0 };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'popular') sortOption = { sold_count: -1 };
        else if (sort === 'rating') sortOption = { rating: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Autocomplete search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } }
            ]
        }).select('name price images').limit(8);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Featured, Trending, New Arrivals, Best Sellers
router.get('/featured', async (req, res) => {
    try {
        const featured = await Product.find({ is_featured: true }).limit(8);
        const trending = await Product.find({ is_trending: true }).limit(8);
        const newArrivals = await Product.find({ is_new_arrival: true }).limit(8);
        const bestSellers = await Product.find({ is_best_seller: true }).limit(8);
        res.json({ featured, trending, newArrivals, bestSellers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get brands list
router.get('/brands', async (req, res) => {
    try {
        const brands = await Product.distinct('brand');
        res.json(brands.filter(b => b).sort());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single product with reviews
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
        res.json({ product, reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get related products
router.get('/:id/related', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.json([]);
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);
        res.json(related);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
