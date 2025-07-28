const express = require('express')
const { createOrder, veriFyPayment } = require('../controllers/payment.controller')

const router = express.Router()

router.post('/create-order',createOrder)
router.post('/verify-payment',veriFyPayment)

module.exports = router