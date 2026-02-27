const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        user = new User({ name, email, password, phone });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(201).json({ token, user: { id: user._id, name, email, phone, role: 'user' } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const userSafe = user.toObject();
        delete userSafe.password;

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
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        await user.save();
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
