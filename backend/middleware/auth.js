const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token, access denied' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query('SELECT id, name, email, phone, address, avatar, role FROM users WHERE id = ?', [decoded.id]);
        if (!rows.length) return res.status(401).json({ message: 'User not found' });
        req.user = rows[0];
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalid' });
    }
};

const adminAuth = async (req, res, next) => {
    await auth(req, res, () => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        next();
    });
};

module.exports = { auth, adminAuth };
