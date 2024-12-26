const express = require('express');
const paymentController = require('../controllers/payment-controller');

const router = express.Router();

//маршрут для оплаты в CheckoutForm.js
router.post('/create-payment-intent', paymentController.createPaymentIntent);

module.exports = router;
