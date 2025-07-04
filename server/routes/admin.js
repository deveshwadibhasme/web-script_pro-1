const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    });
}

// Admin panel
router.get('/panel', auth, async (req, res) => {
    const users = await User.find({ role: 'user' });
    res.json({ users });
});

module.exports = router;
