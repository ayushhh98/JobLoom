const Payment = require('../models/Payment');
const User = require('../models/User');
const Stripe = require('stripe');

// Initialize Stripe (Test Mode Key)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Protected
exports.createPaymentIntent = async (req, res) => {
    try {
        const { plan, amount } = req.body;

        if (!plan || !amount) {
            return res.status(400).json({ success: false, message: 'Please provide plan and amount' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in cents
            currency: 'inr',
            description: `Subscription for ${plan} Plan`,
            metadata: {
                userId: req.user._id.toString(),
                plan: plan
            },
            payment_method_types: ['card', 'upi'], // Explicitly enable Card and UPI
            // automatic_payment_methods: { enabled: true }, // Disabled to force UPI without dashboard config
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (err) {
        console.error('Stripe API Error:', err);
        // Fallback for Development/Demo without valid Keys
        console.log('Falling back to MOCK Payment Intent...');
        res.status(200).send({
            clientSecret: 'mock_secret_' + Date.now(),
            isMock: true
        });
    }
};

// @desc    Verify Payment (Client Side Success -> Server DB Update)
// @route   POST /api/payment/verify
// @access  Protected
exports.verifyPayment = async (req, res) => {
    try {
        const { plan, paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: 'Missing payment intent ID' });
        }

        // Check for Mock ID (Bypass Stripe)
        let paymentIntent;
        if (paymentIntentId.startsWith('pay_mock_')) {
            paymentIntent = {
                status: 'succeeded',
                amount: 0, // In real app, we might want to pass this in
                id: paymentIntentId
            };
        } else {
            // Ideally verify with Stripe API again to be sure
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        }

        if (paymentIntent.status === 'succeeded') {

            // Check if already recorded
            const existing = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
            if (existing) {
                return res.status(200).json({ success: true, message: 'Payment already verified', data: existing });
            }

            // Save Payment
            const payment = await Payment.create({
                userId: req.user._id,
                plan: plan || 'Unknown',
                amount: paymentIntent.amount / 100,
                transactionId: paymentIntentId, // Use Intent ID as Trans ID
                stripePaymentIntentId: paymentIntentId,
                status: 'Approved'
            });

            // Update User Subscription
            await User.findByIdAndUpdate(req.user._id, {
                subscription: {
                    plan: plan,
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 Year
                    status: 'Active'
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Payment verified and subscription activated',
                data: payment
            });
        } else {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Verification Failed' });
    }
};
