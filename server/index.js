const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(cors());
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

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', authRoutes);

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
