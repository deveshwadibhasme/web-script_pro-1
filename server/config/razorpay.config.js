const razorpay = require('razorpay')

const dotenv = require('dotenv')
dotenv.config();

const createRazorpayInstance = () => {
    return (new razorpay({
        key_id: process.env.RAZORPAY_ID_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    }))

}

module.exports = {
    createRazorpayInstance
}
