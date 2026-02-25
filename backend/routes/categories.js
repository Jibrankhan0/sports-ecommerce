const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
