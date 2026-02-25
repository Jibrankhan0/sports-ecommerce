const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Get all products with filtering, sorting, search, pagination
router.get('/', async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, rating, inStock, sort, search, page = 1, limit = 12 } = req.query;
        let where = ['1=1'];
        let params = [];

        if (category) { where.push('c.slug = ?'); params.push(category); }
        if (brand) { where.push('p.brand = ?'); params.push(brand); }
        if (minPrice) { where.push('p.price >= ?'); params.push(Number(minPrice)); }
        if (maxPrice) { where.push('p.price <= ?'); params.push(Number(maxPrice)); }
        if (rating) { where.push('p.rating >= ?'); params.push(Number(rating)); }
        if (inStock === 'true') { where.push('p.stock > 0'); }
        if (search) { where.push('(p.name LIKE ? OR p.brand LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

        let orderBy = 'p.created_at DESC';
        if (sort === 'price_asc') orderBy = 'p.price ASC';
        else if (sort === 'price_desc') orderBy = 'p.price DESC';
        else if (sort === 'popular') orderBy = 'p.sold_count DESC';
        else if (sort === 'rating') orderBy = 'p.rating DESC';
        else if (sort === 'newest') orderBy = 'p.created_at DESC';

        const offset = (Number(page) - 1) * Number(limit);
        const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
        const [products] = await pool.query(query, [...params, Number(limit), offset]);
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${where.join(' AND ')}`,
            params
        );
        const parsed = products.map(p => ({ ...p, images: parseImages(p.images) }));
        res.json({ products: parsed, total: countResult[0].total, page: Number(page), pages: Math.ceil(countResult[0].total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Autocomplete search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);
        const [rows] = await pool.query(
            'SELECT id, name, price, images FROM products WHERE name LIKE ? OR brand LIKE ? LIMIT 8',
            [`%${q}%`, `%${q}%`]
        );
        res.json(rows.map(p => ({ ...p, images: parseImages(p.images) })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Featured, Trending, New Arrivals, Best Sellers
router.get('/featured', async (req, res) => {
    try {
        const [featured] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_featured=1 LIMIT 8');
        const [trending] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_trending=1 LIMIT 8');
        const [newArrivals] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_new_arrival=1 LIMIT 8');
        const [bestSellers] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_best_seller=1 LIMIT 8');
        res.json({
            featured: featured.map(p => ({ ...p, images: parseImages(p.images) })),
            trending: trending.map(p => ({ ...p, images: parseImages(p.images) })),
            newArrivals: newArrivals.map(p => ({ ...p, images: parseImages(p.images) })),
            bestSellers: bestSellers.map(p => ({ ...p, images: parseImages(p.images) })),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get brands list
router.get('/brands', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand');
        res.json(rows.map(r => r.brand));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single product with reviews
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Product not found' });
        const product = { ...rows[0], images: parseImages(rows[0].images) };
        const [reviews] = await pool.query('SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC', [req.params.id]);
        res.json({ product, reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get related products
router.get('/:id/related', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT category_id FROM products WHERE id=?', [req.params.id]);
        if (!rows.length) return res.json([]);
        const [related] = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.category_id=? AND p.id!=? LIMIT 4',
            [rows[0].category_id, req.params.id]
        );
        res.json(related.map(p => ({ ...p, images: parseImages(p.images) })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function parseImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
}

module.exports = router;
