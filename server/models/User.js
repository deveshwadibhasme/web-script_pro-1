const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: [{ name:String, imageUrl: String, productId: String, quantity: Number }]
});

module.exports = mongoose.model('User', userSchema);
