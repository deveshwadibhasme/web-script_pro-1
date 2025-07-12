const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const Admin = require('../models/Admin');
dotenv.config();
router.use(cookieParser());

// Register endpoint
router.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: 'Missing username, password, or email' });
    }
    const { email, username, password, address, number } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const userEmail = await User.findOne({ email });
    if (userEmail) return res.json({ message: 'Email already exists' });
    const user = new User({ email, username, password: hash, address, number });
    await user.save();
    res.json({ message: 'Registered' });
});

router.post('/register/admin', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: 'Missing username, password, or email' });
    }
    const { email, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const userEmail = await User.findOne({ email });
    if (userEmail) return res.json({ message: 'Email already exists' });
    const user = new Admin({ email, username, password: hash });
    await user.save();
    res.json({ message: 'Registered' });
});

// Login endpoint
router.post('/login', async (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const admin = await Admin.findOne({ email });
    if (!user && !admin) return res.status(400).json({ message: 'User not found' });
    if (user) {
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('token', token);
        res.json({ token, role: user.role, username: user.username });
    }
    if (admin) {
        const validAdmin = await bcrypt.compare(password, admin.password);
        if (!validAdmin) return res.status(400).json({ message: 'Invalid credentials Admin' });
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('token', token);
        res.json({ token, role: admin.role, username: admin.username });
    }
});


module.exports = router;
