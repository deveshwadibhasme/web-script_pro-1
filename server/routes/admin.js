const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const upload = require('../middleware/upload');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const multer = require('multer');

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
    const order = await Order.find({});
    const products = await Product.find({});
    res.json({ users, order, products });
});

router.post('/block-user/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.adminRestrict = true;
        await user.save();
        res.status(200).json({ message: 'User blocked successfully.', user });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.post('/unblock-user/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.adminRestrict = false;
        await user.save();
        res.status(200).json({ message: 'User unblocked successfully.', user });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


router.post('/add-products', auth, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error (Specific):', err.message);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            console.error('Unknown File Upload Error (Detailed):', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

            return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
        }

        try {
            const { name, category, price, productId, stock } = req.body;

            const admin = await Admin.findById(req.user.id);
            if (!admin) return res.status(404).json({ message: 'Admin not found' });

            let product = await Product.findOne({ productId, adminId: admin._id });

            if (!product) {
                await Product.create({
                    adminId: admin._id,
                    name,
                    category,
                    productId,
                    stock: Number(stock),
                    imageUrl: req.file?.path || '',
                    price: Number(price)
                });
                return res.status(201).json({ message: 'Product added successfully', products: await Product.find({ adminId: admin._id }) });
            } else {
                product.stock = Number(product.stock) + Number(stock);
                await product.save();
                return res.json({ message: 'Product stock updated successfully' });
            }
        } catch (err) {
            // Also ensure this catch block prints detailed errors
            console.error('Error in /add-products (Mongoose/Logic):', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            res.status(500).json({ message: 'Internal server error' });
        }
    }); // End of upload.single('image') wrapper
});



module.exports = router;
