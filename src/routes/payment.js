const express = require('express');
const { userAuth } = require('../middlewares/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razorpay');
const Payment = require('../models/payment');
const User = require('../models/user');
const { membershipAmount } = require('../utils/constants');

paymentRouter.post('/payment/create', userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: 'INR',
      receipt: 'receipt#1',
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

paymentRouter.get('/premium/verify', userAuth, async (req, res) => {
  const user = req.user.toJSON();
  console.log(user);
  if (user.isPremium) {
    return res.json({ ...user });
  }
  return res.json({ ...user });
});

module.exports = paymentRouter;
