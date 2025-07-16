const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const Admin = require('../models/Admin');
const otpStore = require('../models/otpStore');
const sendEmail = require('../middleware/email');
dotenv.config();
router.use(cookieParser());
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register endpoint
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Missing fields' });
    const existingUser = await Admin.findOne({ email });
    if (existingUser)
        return res.status(409).json({ message: 'Email already exists' });
    const existingOTP = await otpStore.findOne({ email });
    if (existingOTP)
        await otpStore.deleteOne({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await otpStore.create({ email, role: 'user', password, otp, expiresAt });
    const result = await sendEmail(email, `Your OTP to register in Sell Anything is ${otp}`);
    if (result.success) {
        return res.json({ message: 'OTP sent to email' });
    } else {
        return res.status(500).json({ message: 'Failed to send OTP email', error: result.error.message });
    }
    // if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
    //     return res.status(400).json({ message: 'Missing username, password, or email' });
    // }
    // const { email, username, password, address, phone } = req.body;
    // const hash = await bcrypt.hash(password, 10);
    // const userEmail = await User.findOne({ email });
    // if (userEmail) return res.json({ message: 'Email already exists' });
    // const user = new User({ email, username, password: hash, address, phone });
    // await user.save();
    // res.json({ message: 'Registered' });
});

router.post('/register/admin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Missing fields' });
    const existingUser = await Admin.findOne({ email });
    if (existingUser)
        return res.status(409).json({ message: 'Email already registered' });
    const existingOTP = await otpStore.findOne({ email });
    if (existingOTP)
        await otpStore.deleteOne({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await otpStore.create({ email, role: 'admin', password, otp, expiresAt });
    await sendEmail(email, `Your OTP to register in Sell Anything is ${otp}`);
    res.json({ message: 'OTP sent to email' });
    // if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
    //     return res.status(400).json({ message: 'Missing username, password, or email' });
    // }
    // const { email, username, password } = req.body;
    // const hash = await bcrypt.hash(password, 10);
    // const userEmail = await User.findOne({ email });
    // if (userEmail) return res.json({ message: 'Email already exists' });
    // const user = new Admin({ email, username, password: hash });
    // await user.save();
    // res.json({ message: 'Registered' });
});


router.post('/verify-otp', async (req, res) => {
    const { email, username, address, phone, otp } = req.body;

    const record = await otpStore.findOne({ email });
    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hash = await bcrypt.hash(record.password, 10);
    if (record.role === 'admin') {
        const user = new Admin({ email, username, password: hash });
        await user.save();
    }
    if (record.role === 'user') {
        const user = new User({ email, username, address, phone, password: hash });
        await user.save();
    }

    await otpStore.deleteOne({ email });

    res.json({ message: 'Registration successful' });
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
