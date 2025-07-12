const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  name: String,
  imageUrl: String,
  productId: {type: String, default: `PRO${Math.floor(Math.random() * 10000)}`},
  price: Number,
  category: String,
  stock: Number
});

module.exports = mongoose.model('Product', ProductSchema);