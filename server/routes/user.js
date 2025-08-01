const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

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

router.post('/add-to-cart', auth, async (req, res) => {
    try {
        const { productId, quantity, totalPrice } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const cartItem = user.cart.find(item =>
            item.product.toString() === product._id.toString()
        );

        if (totalPrice) {
            cartItem.totalPrice = totalPrice
            await user.save()
        }

        if (cartItem) {
            if (Number(quantity) < 0) {
                user.cart = user.cart.filter(item => item.product.toString() !== product._id.toString());
                await user.save();
                return res.status(200).json({ message: 'Product removed from cart.' });
            }
            if (cartItem.quantity < quantity) {
                cartItem.quantity = Number(quantity);
                await user.save();
                return res.status(200).json({ message: 'Product quantity updated.' });
            } else if (cartItem.quantity > quantity) {
                cartItem.quantity = Number(quantity);
                await user.save();
                return res.status(200).json({ message: 'Product quantity updated.' });
            }
        } else {
            user.cart.push({
                product: product._id,
                quantity: quantity
            });
        }

        await user.save();

        res.status(200).json({ message: 'Product added to cart successfully.', cart: user.cart });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
})

router.get('/get-cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('cart.product');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ cart: user.cart });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
})

router.post('/total-price', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('cart.product');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const totalPrice = user.cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
        if (user.cart[0]) user.cart[0].totalPrice = totalPrice;

        await user.save();

        res.status(200).json({ message: 'Total Price Updated', totalPrice: totalPrice });

    } catch (error) {
        console.error('Get total price error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
})

// User panel
router.get('/panel', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ user });
});


router.get('/all-product', async (req, res) => {
    try {
        const productList = await Product.find({})

        res.status(200).json(productList);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error', err: error })
    }
})


router.get('/featured-product', async (req, res) => {
    try {
        const randomItems = await Product.aggregate([{ $sample: { size: 6 } }]);
        res.status(200).json(randomItems);
    } catch (err) {
        console.error('Error fetching random items:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/order', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const user = await User.findById(req.user.id).populate('cart.product');


        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newOrder = new Order({
            user: user._id,
            items: user.cart.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                imageUrl: item.product.imageUrl || 'N/A'
            })),
            shippingAddress: user.address || 'N/A', 
            phone: user.phone || 'N/A',
            payment: {
                method: 'Razorpay',
                isPaid: true,
                paidAt: new Date(),
                paymentDetails: {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature
                }
            },
            totalAmount: user.cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
            status: 'pending'
        });

        user.cart = [];


        await newOrder.save();

        user.orders.push(newOrder._id);

        await user.save();

        res.status(200).json({ message: 'Order created successfully and cart cleared.' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/get-orders', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('orders');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ orders: user.orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



module.exports = router;
