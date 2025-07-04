const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// Register endpoint
router.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.role) {
        return res.status(400).json({ message: 'Missing username, password, or role' });
    }
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role });
    await user.save();
    res.json({ message: 'Registered' });
});

// Login endpoint
router.post('/login', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, role: user.role });
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
