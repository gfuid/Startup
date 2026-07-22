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

// @desc    Validate and Save Provider Payout / Bank Details
// @route   POST /api/v1/payments/provider-payout-details
exports.updateProviderPayoutDetails = async (req, res) => {
    try {
        const User = require('../models/User');
        const { upiId, accountNumber, ifscCode, bankName, accountHolderName } = req.body;

        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        const accRegex = /^[0-9]{9,18}$/;

        // Validate UPI if provided
        if (upiId && !upiRegex.test(upiId.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UPI ID format! Must be in format user@upi / 9876543210@ybl'
            });
        }

        // Validate Bank Details if provided
        if (accountNumber && !accRegex.test(accountNumber.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Account Number! Must be between 9 to 18 numeric digits.'
            });
        }

        if (ifscCode && !ifscRegex.test(ifscCode.trim().toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IFSC Code! Must be 11 characters (e.g. SBIN0001234)'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.providerDetails = user.providerDetails || {};
        if (upiId) user.providerDetails.upiId = upiId.trim();
        user.providerDetails.bankAccountDetails = {
            accountNumber: accountNumber ? accountNumber.trim() : user.providerDetails?.bankAccountDetails?.accountNumber || '',
            ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : user.providerDetails?.bankAccountDetails?.ifscCode || '',
            bankName: bankName || user.providerDetails?.bankAccountDetails?.bankName || '',
            accountHolderName: accountHolderName || user.providerDetails?.bankAccountDetails?.accountHolderName || '',
        };
        user.providerDetails.isPaymentVerified = true;

        await user.save();

        console.log(`✅ Payout details verified & updated for provider: ${user._id}`);

        res.json({
            success: true,
            message: 'Payout details verified and saved successfully! 🎉',
            providerDetails: user.providerDetails
        });
    } catch (error) {
        console.error('❌ Update payout details error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
