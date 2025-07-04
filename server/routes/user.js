const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const router = express.Router();

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err || decoded.role !== 'user') return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    });
}

// User panel
router.get('/panel', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ username: user.username, cart: user.cart });
});

// Add to cart
router.post('/cart', auth, upload.single('image'), async (req, res) => {
    const { productId, name, quantity } = req.body;
    const user = await User.findById(req.user.id);
    const item = user.cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = Number(item.quantity) + Number(quantity);
    } else {
        user.cart.push({ productId, name, quantity , imageUrl: req.file.path });
    }
    await user.save();
    res.json({ cart: user.cart });
});

// Image upload route
// router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
//     if (!req.file || !req.file.path) {
//         return res.status(400).json({ message: 'No image uploaded' });
//     }
//     const user = await User.findById(req.user.id);
//     const item = user.cart.find(i => i.productId === productId);
//     user.cart.push([...user.cart, { image: req.file.path }]);
//     await user.save();
//     res.json({ cart: user.cart });
//     res.json({ image: req.file.path });
// });

module.exports = router;
