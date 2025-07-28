// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String, // snapshot of product name at time of order
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot of product price
  totalPrice: { type: Number, required: true } // quantity * price
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null 
  },
  items: [orderItemSchema],
  shippingAddress: {type: String, required: true},
  payment: {
    method: { type: String, enum: ['COD', 'Razorpay', 'Stripe'], default: 'COD' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentDetails: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
