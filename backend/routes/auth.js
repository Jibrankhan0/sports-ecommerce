const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(400).json({ message: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashed, phone || null]
        );
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ token, user: { id: result.insertId, name, email, phone, role: 'user' } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const { password: _, ...userSafe } = user;
        res.json({ token, user: userSafe });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current user
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        await pool.query('UPDATE users SET name=?, phone=?, address=? WHERE id=?', [name, phone, address, req.user.id]);
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const [rows] = await pool.query('SELECT password FROM users WHERE id=?', [req.user.id]);
        const match = await bcrypt.compare(oldPassword, rows[0].password);
        if (!match) return res.status(400).json({ message: 'Old password incorrect' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password=? WHERE id=?', [hashed, req.user.id]);
        res.json({ message: 'Password changed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
