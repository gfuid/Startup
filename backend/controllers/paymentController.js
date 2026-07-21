// backend/controllers/paymentController.js
const Booking = require('../models/Booking');

// @desc    Create simulated Razorpay order
// @route   POST /api/v1/payments/order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide bookingId and amount'
            });
        }

        // Generate a mock Razorpay order ID
        const mockOrderId = `order_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

        res.status(200).json({
            success: true,
            orderId: mockOrderId,
            amount: amount,
            currency: 'INR'
        });
    } catch (error) {
        console.error('❌ Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// @desc    Verify payment and update booking status
// @route   POST /api/v1/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            bookingId, 
            razorpay_order_id, 
            razorpay_payment_id, 
            status 
        } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (status === 'success') {
            // Update booking payment info
            booking.paymentStatus = 'paid';
            booking.paymentDetails = {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
                verifiedAt: new Date()
            };

            await booking.save();
            console.log(`💰 Payment success recorded for booking: ${bookingId}`);

            // Notify clients in real-time via Socket.io
            if (global.io) {
                global.io.to(`booking_${bookingId}`).emit('booking_payment_completed', {
                    bookingId,
                    paymentStatus: 'paid'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified and updated successfully',
                booking
            });
        } else {
            booking.paymentStatus = 'failed';
            await booking.save();
            console.log(`❌ Payment failure recorded for booking: ${bookingId}`);

            return res.status(400).json({
                success: false,
                message: 'Payment failed'
            });
        }
    } catch (error) {
        console.error('❌ Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};
