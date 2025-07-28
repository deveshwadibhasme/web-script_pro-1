const { createRazorpayInstance } = require("../config/razorpay.config")
const crypto = require('crypto');
require('dotenv').config();

exports.createOrder = async (req, res) => {
    const { panelData } = req.body;

    const total = Number(panelData?.cart[0]?.totalPrice);

    if (!total || isNaN(total) || total <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing totalPrice in cart"
        });
    }

    const amountInPaise = Math.round(total * 100);

    const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
        notes: {
            userEmail: panelData.email,
            userPhone: panelData.phone,
            userAddress: panelData.address,
        }
    };

    try {
        const razorpay = createRazorpayInstance();
        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || error,
        });
    }
}


exports.veriFyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const secret = process.env.RAZORPAY_SECRET_KEY

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id)

    const expectedSignature = hmac.digest('hex')

    if (razorpay_signature === expectedSignature) {
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        })
    }
    else {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        })
    }
}