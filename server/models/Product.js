const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  name: String,
  imageUrl: String,
  productId: {type: String, default: `PRO${generateUniqueFourDigitNumber()}`},
  price: Number,
  category: String,
  stock: Number
});

function generateUniqueFourDigitNumber() {
  const digits = '0123456789'.split('');
  let result = '';

  // First digit (should not be 0)
  result += digits.splice(Math.floor(Math.random() * 9) + 1, 1);

  // Remaining 3 digits
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * digits.length);
    result += digits.splice(index, 1);
  }

  return result;
}

module.exports = mongoose.model('Product', ProductSchema);