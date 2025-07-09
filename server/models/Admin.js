const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: String,
    password: String,
    products: [{ name: String, imageUrl: String, productId: String, quantity: Number, price: Number }],
    role: { type: String, enum: ['user', 'admin'], default: 'admin' },
});

// role: { type: String, enum: ['user', 'admin'], default: 'user' },
module.exports = mongoose.model('Admin', adminSchema);
