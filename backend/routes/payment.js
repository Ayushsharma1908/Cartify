const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @POST /api/payment/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to paisa
      currency,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/payment/confirm/:orderId
router.post('/confirm/:orderId', protect, async (req, res) => {
  try {
    const { paymentIntentId, paymentStatus } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'Processing';
      order.stripePaymentIntentId = paymentIntentId;
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
        emailAddress: req.user.email
      };
      await order.save();

      return res.json({ success: true, message: 'Payment confirmed', order });
    }

    res.status(400).json({ success: false, message: 'Payment not successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/payment/webhook (Stripe webhook for async events)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object;
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { isPaid: true, paidAt: Date.now(), orderStatus: 'Processing' }
      );
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;
  }

  res.json({ received: true });
});

module.exports = router;
