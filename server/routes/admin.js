const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const upload = require('../middleware/upload');

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

router.post('/products', auth, upload.single('image'), async (req, res) => {
    const { name, catagory, price, productId } = req.body;
    const user = await User.findById(req.user.id);
    const item = user.cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = Number(item.quantity) + Number(quantity);
    } else {
        user.cart.push({ productId, name, quantity , imageUrl: req.file.path, price });
    }
    await user.save();
    res.json({ cart: user.cart });
});

module.exports = router;
