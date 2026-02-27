const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

// ---- ANALYTICS (Renamed to /stats for frontend) ----
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await Promise.all([
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.countDocuments(),
            User.countDocuments({ role: 'user' }),
            Product.countDocuments()
        ]);

        const totalRevenue = stats[0][0]?.total || 0;
        const totalOrders = stats[1];
        const totalUsers = stats[2];
        const totalProducts = stats[3];

        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: "$_id", total: 1, _id: 0 } }
        ]);

        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.product_name" },
                    sold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 5 }
        ]);

        const lowStock = await Product.find({ stock: { $lt: 10 } })
            .populate('category', 'name')
            .limit(10);

        res.json({
            revenue: totalRevenue,
            orders: totalOrders,
            users: totalUsers,
            products: totalProducts,
            monthlyRevenue,
            topProducts,
            lowStockProducts: lowStock
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- PRODUCTS ----
router.get('/products', adminAuth, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/products', adminAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, specifications, price, discount_price, stock, category_id, brand, is_featured, is_trending, is_new_arrival, is_best_seller } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        let images = [];
        if (req.files && req.files.length) {
            images = req.files.map(f => `/uploads/${f.filename}`);
        }

        const product = new Product({
            name, slug, description, specifications, price, brand, stock, images,
            category: category_id || null,
            discount_price: discount_price || null,
            is_featured: is_featured === 'true',
            is_trending: is_trending === 'true',
            is_new_arrival: is_new_arrival === 'true',
            is_best_seller: is_best_seller === 'true'
        });

        await product.save();
        res.status(201).json({ message: 'Product created', id: product._id });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/products/:id', adminAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, specifications, price, discount_price, stock, category_id, brand, is_featured, is_trending, is_new_arrival, is_best_seller, existing_images } = req.body;

        let images = [];
        if (existing_images) {
            try { images = JSON.parse(existing_images); } catch { images = []; }
        }
        if (req.files && req.files.length) {
            images = [...images, ...req.files.map(f => `/uploads/${f.filename}`)];
        }

        const updateData = {
            name, description, specifications, price, brand, stock, images,
            category: category_id || null,
            discount_price: discount_price || null,
            is_featured: is_featured === 'true',
            is_trending: is_trending === 'true',
            is_new_arrival: is_new_arrival === 'true',
            is_best_seller: is_best_seller === 'true'
        };

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: 'Product updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- CATEGORIES ----
router.get('/categories', adminAuth, async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            {
                $project: {
                    name: 1, slug: 1, description: 1, image: 1,
                    product_count: { $size: '$products' }
                }
            }
        ]);
        res.json(categories);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/categories', adminAuth, async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const category = new Category({ name, slug, description, image });
        await category.save();
        res.status(201).json({ message: 'Category created', id: category._id });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/categories/:id', adminAuth, async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await Category.findByIdAndUpdate(req.params.id, { name, slug, description, image });
        res.json({ message: 'Category updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- ORDERS ----
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const orders = await Order.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/orders/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Order status updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- USERS ----
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('name email phone role createdAt')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users/:id/orders', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
