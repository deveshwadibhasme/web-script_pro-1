const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true 
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
  },
}, { _id: false }); 

const paymentDetailsSchema = new mongoose.Schema({
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String }
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

  items: {
    type: [orderItemSchema],
    validate: [arr => arr.length > 0, 'Order must contain at least one item']
  },

  shippingAddress: {
    type: String,
    required: true
  },

  payment: {
    method: {
      type: String,
      enum: ['COD', 'Razorpay', 'Stripe'],
      default: 'Razorpay'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    paymentDetails: paymentDetailsSchema
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Order', orderSchema);