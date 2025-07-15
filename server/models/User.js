const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: String,
    password: String,
    address: String,
    phone: { type: Number, required: true, unique: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    cart: [{
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: "1" }
    }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

// role: { type: String, enum: ['user', 'admin'], default: 'user' },
module.exports = mongoose.model('User', userSchema);
