const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
dotenv.config();



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

const app = express();
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "*",
     methods: ['GET', 'POST', 'OPTIONS','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected')).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Import routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const router = require('./routes/payment.routes');

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', authRoutes);
app.use('/payment', auth , router)

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
