const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
router.use(cookieParser());

// Register endpoint
router.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: 'Missing username, password, or email' });
    }
    const { email, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const userEmail = await User.findOne({ email });
    if (userEmail) return res.json({ message: 'Email already exists' }); 
    console.log(`Email already exists`);
    const user = new User({ email, username, password: hash });
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
    if (!user) return res.status(400).json({ message: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    // console.log(`Validating user ${password, user.passwor}:`);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.cookie('token', token);
    res.json({ token, role: user.role ,username: user.username});
});

// // Example: Sending token in Authorization header
// fetch('http://localhost:5000/user/panel', {
//   method: 'GET',
//   headers: {
//     'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
//   }
// })
// .then(res => res.json())
// .then(data => console.log(data))
// .catch(err => console.error(err));

module.exports = router;
