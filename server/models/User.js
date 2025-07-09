const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: String,
    password: String,
    cart: [{ name: String, imageUrl: String, productId: String, quantity: Number, price: Number }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

// role: { type: String, enum: ['user', 'admin'], default: 'user' },
module.exports = mongoose.model('User', userSchema);
