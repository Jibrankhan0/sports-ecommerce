const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage Config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sports-ecommerce',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Wrapper to handle multer errors
const uploadMiddleware = (req, res, next) => {
    const uploadTask = upload.array('images', 5);
    uploadTask(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('Other Upload Error:', err);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

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

router.post('/products', adminAuth, uploadMiddleware, async (req, res) => {
    try {
        console.log('--- PRODUCT UPLOAD START ---');
        const { name, description, specifications, price, discount_price, stock, category_id, brand, is_featured, is_trending, is_new_arrival, is_best_seller } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and Price are required' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        let images = [];
        if (req.files && req.files.length) {
            images = req.files.map(f => f.path); // Cloudinary returns the full URL in .path
        }

        const productData = {
            name, slug, description, specifications, price, brand: brand || 'Generic', stock: stock || 0, images,
            discount_price: discount_price || null,
            is_featured: is_featured === 'true',
            is_trending: is_trending === 'true',
            is_new_arrival: is_new_arrival === 'true',
            is_best_seller: is_best_seller === 'true'
        };

        if (category_id && category_id !== 'undefined' && category_id !== '') {
            productData.category = category_id;
        }

        const product = new Product(productData);
        await product.save();
        console.log('✅ Product saved:', product._id);
        res.status(201).json({ message: 'Product created', id: product._id });
    } catch (err) {
        console.error('❌ PRODUCT UPLOAD ERROR:', err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/products/:id', adminAuth, uploadMiddleware, async (req, res) => {
    try {
        console.log('--- PRODUCT UPDATE START ---');
        const { name, description, specifications, price, discount_price, stock, category_id, brand, is_featured, is_trending, is_new_arrival, is_best_seller, existing_images } = req.body;

        let images = [];
        if (existing_images) {
            try {
                images = JSON.parse(existing_images);
            } catch {
                images = Array.isArray(existing_images) ? existing_images : [existing_images];
            }
        }

        if (req.files && req.files.length) {
            const newImages = req.files.map(f => f.path); // Cloudinary returns the full URL in .path
            images = [...images, ...newImages];
        }

        const updateData = {
            name, description, specifications, price, brand, stock, images,
            discount_price: discount_price || null,
            is_featured: is_featured === 'true',
            is_trending: is_trending === 'true',
            is_new_arrival: is_new_arrival === 'true',
            is_best_seller: is_best_seller === 'true'
        };

        if (category_id && category_id !== 'undefined' && category_id !== '') {
            updateData.category = category_id;
        } else {
            updateData.category = null;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        console.log('✅ Product updated');
        res.json({ message: 'Product updated' });
    } catch (err) {
        console.error('❌ PRODUCT UPDATE ERROR:', err);
        res.status(500).json({ message: err.message });
    }
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
        if (!name) return res.status(400).json({ message: 'Name is required' });
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
