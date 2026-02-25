const express = require('express');
const pool = require('../config/db');
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
        const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total),0) as total_revenue FROM orders WHERE status != 'cancelled'");
        const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
        const [[{ total_users }]] = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role='user'");
        const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM products');

        const [monthly_revenue] = await pool.query(`
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, SUM(total) as total
            FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month ORDER BY month
        `);

        const [top_products] = await pool.query(`
            SELECT p.name, SUM(oi.quantity) as sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY sold DESC
            LIMIT 5
        `);

        const [low_stock] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.stock < 10 
            LIMIT 10
        `);

        res.json({
            revenue: total_revenue,
            orders: total_orders,
            users: total_users,
            products: total_products,
            monthlyRevenue: monthly_revenue,
            topProducts: top_products,
            lowStockProducts: low_stock
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- PRODUCTS ----
router.get('/products', adminAuth, async (req, res) => {
    try {
        const { search } = req.query;
        let where = '1=1', params = [];
        if (search) { where += ' AND (p.name LIKE ? OR p.brand LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE ${where} ORDER BY p.created_at DESC`,
            params
        );
        res.json(products.map(p => ({ ...p, images: parseImages(p.images) })));
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
        const [result] = await pool.query(
            'INSERT INTO products (name, slug, description, specifications, price, discount_price, stock, category_id, brand, images, is_featured, is_trending, is_new_arrival, is_best_seller) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [name, slug, description, specifications, price, discount_price || null, stock, category_id, brand, JSON.stringify(images),
                is_featured === 'true' ? 1 : 0, is_trending === 'true' ? 1 : 0, is_new_arrival === 'true' ? 1 : 0, is_best_seller === 'true' ? 1 : 0]
        );
        res.status(201).json({ message: 'Product created', id: result.insertId });
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
        await pool.query(
            'UPDATE products SET name=?, description=?, specifications=?, price=?, discount_price=?, stock=?, category_id=?, brand=?, images=?, is_featured=?, is_trending=?, is_new_arrival=?, is_best_seller=? WHERE id=?',
            [name, description, specifications, price, discount_price || null, stock, category_id, brand, JSON.stringify(images),
                is_featured === 'true' ? 1 : 0, is_trending === 'true' ? 1 : 0, is_new_arrival === 'true' ? 1 : 0, is_best_seller === 'true' ? 1 : 0, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- CATEGORIES ----
router.get('/categories', adminAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON p.category_id=c.id GROUP BY c.id');
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/categories', adminAuth, async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const [result] = await pool.query('INSERT INTO categories (name, slug, description, image) VALUES (?,?,?,?)', [name, slug, description, image]);
        res.status(201).json({ message: 'Category created', id: result.insertId });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/categories/:id', adminAuth, async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await pool.query('UPDATE categories SET name=?, slug=?, description=?, image=? WHERE id=?', [name, slug, description, image, req.params.id]);
        res.json({ message: 'Category updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id=?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- ORDERS ----
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        let where = '1=1', params = [];
        if (status) { where += ' AND o.status=?'; params.push(status); }
        const [orders] = await pool.query(
            `SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE ${where} ORDER BY o.created_at DESC`,
            params
        );
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/orders/:id', adminAuth, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?', [req.params.id]);
        if (!orders.length) return res.status(404).json({ message: 'Order not found' });
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [req.params.id]);
        res.json({ ...orders[0], items });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
        await pool.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- USERS ----
router.get('/users', adminAuth, async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, name, email, phone, role, created_at FROM users WHERE role='user' ORDER BY created_at DESC");
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users/:id/orders', adminAuth, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [req.params.id]);
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

function parseImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
}

module.exports = router;
