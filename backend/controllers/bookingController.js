// backend/controllers/bookingController.js - COMPLETE FIXED VERSION
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create booking
// @route   POST /api/v1/bookings
exports.createBooking = async (req, res) => {
    try {
        console.log('📝 Received booking request:', req.body);

        const {
            serviceId,
            scheduledDate,
            scheduledTime,
            address,
            notes,
            customerName,
            customerPhone
        } = req.body;

        const customerId = req.user.id;

        // Get service details
        const service = await Service.findById(serviceId);
        if (!service) {
            console.log('❌ Service not found:', serviceId);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Find available provider — match by service category & prefer online
        let provider = await User.findOne({
            role: 'provider',
            isActive: true,
            'providerDetails.isApproved': true,
            'providerDetails.isOnline': true,
            'providerDetails.services': { $in: [service.name, service._id] }
        });

        // Fallback: any approved online provider
        if (!provider) {
            provider = await User.findOne({
                role: 'provider',
                isActive: true,
                'providerDetails.isApproved': true,
                'providerDetails.isOnline': true,
            });
        }

        // Fallback: any approved provider (even offline)
        if (!provider) {
            provider = await User.findOne({
                role: 'provider',
                isActive: true,
                'providerDetails.isApproved': true,
            });
        }

        if (!provider) {
            console.log('❌ No provider available');
            return res.status(404).json({
                success: false,
                message: 'No providers available at the moment. Please try again later.'
            });
        }

        // Create booking with all fields
        const bookingData = {
            customerId,
            providerId: provider._id,
            serviceId,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            address: {
                fullAddress: address,
                street: address.split(',')[0] || address,
                city: address.split(',')[1]?.trim() || '',
                pincode: address.split('-')[1]?.trim() || '',
                latitude: req.body.latitude || null,
                longitude: req.body.longitude || null,
            },
            notes: notes || '',
            totalAmount: service.price,
            status: 'pending',
            paymentStatus: 'pending',
        };

        // Add customer name and phone if provided
        if (customerName) {
            bookingData.customerName = customerName;
        }
        if (customerPhone) {
            bookingData.customerPhone = customerPhone;
        }

        const booking = await Booking.create(bookingData);

        console.log('✅ Booking created:', booking._id);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking._id,
                serviceName: service.name,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                address: booking.address.fullAddress,
                totalAmount: booking.totalAmount,
                status: booking.status,
            }
        });

    } catch (error) {
        console.error('❌ Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// @desc    Get customer bookings
// @route   GET /api/v1/bookings/customer
exports.getCustomerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user.id })
            .populate('serviceId', 'name category price image')
            .populate('providerId', 'name phone profileImage')
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            serviceName: booking.serviceId?.name || 'Service',
            providerName: booking.providerId?.name || 'Provider',
            providerPhone: booking.providerId?.phone,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            address: booking.address?.fullAddress || 'Address not provided',
            amount: booking.totalAmount,
            totalAmount: booking.totalAmount,
            status: booking.status,
        }));

        res.json({
            success: true,
            bookings: formattedBookings,
        });
    } catch (error) {
        console.error('❌ Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get provider bookings
// @route   GET /api/v1/bookings/provider
exports.getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ providerId: req.user.id })
            .populate('serviceId', 'name category price')
            .populate('customerId', 'name phone address')
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            serviceName: booking.serviceId?.name || 'Service',
            customerName: booking.customerId?.name || booking.customerName || 'Customer',
            customerPhone: booking.customerId?.phone || booking.customerPhone,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            address: booking.address?.fullAddress || 'Address not provided',
            amount: booking.totalAmount,
            status: booking.status,
        }));

        res.json({
            success: true,
            bookings: formattedBookings,
        });
    } catch (error) {
        console.error('❌ Get provider bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, cancellationReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        const isProvider = booking.providerId && booking.providerId.toString() === req.user.id;
        const isCustomer = booking.customerId && booking.customerId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isProvider && !isCustomer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking status'
            });
        }

        // Customer can only cancel the booking and only if it's currently pending or accepted
        if (isCustomer && !isProvider && !isAdmin) {
            if (status !== 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Customers are only allowed to cancel bookings'
                });
            }
            if (booking.status !== 'pending' && booking.status !== 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking cannot be cancelled at this stage'
                });
            }
        }

        booking.status = status;
        booking.updatedAt = Date.now();
        if (status === 'cancelled' && cancellationReason) {
            booking.cancellationReason = cancellationReason;
        }
        await booking.save();

        // Trigger real-time status update via Socket.io
        if (global.io) {
            console.log(`📡 Emitting booking_status_changed event to booking_${booking._id}: new status = ${status}`);
            global.io.to(`booking_${booking._id}`).emit('booking_status_changed', {
                bookingId: booking._id,
                status: status
            });
        }

        // Trigger push notifications
        try {
            const { sendPushNotification } = require('../utils/pushNotification');
            
            // If provider changed status, notify customer
            if (isProvider || isAdmin) {
                const customer = await User.findById(booking.customerId);
                if (customer && customer.expoPushToken) {
                    let title = 'Booking Update';
                    let body = `Your booking status has been updated to ${status}.`;
                    
                    if (status === 'accepted') {
                        title = '🎉 Booking Accepted!';
                        body = `Your service booking has been accepted by the provider.`;
                    } else if (status === 'in_progress') {
                        title = '⚡ Service Started';
                        body = `Your provider has started working on your service.`;
                    } else if (status === 'completed') {
                        title = '✅ Service Completed!';
                        body = `Your service booking is marked as completed. Please leave a review.`;
                    }
                    
                    await sendPushNotification(customer.expoPushToken, title, body, { bookingId: booking._id });
                }
            }
            
            // If customer changed status, notify provider
            if (isCustomer) {
                const provider = await User.findById(booking.providerId);
                if (provider && provider.expoPushToken) {
                    let title = 'Booking Update';
                    let body = `Booking status has been updated to ${status}.`;
                    
                    if (status === 'cancelled') {
                        title = '❌ Booking Cancelled';
                        body = `Customer has cancelled their service booking.`;
                    }
                    
                    await sendPushNotification(provider.expoPushToken, title, body, { bookingId: booking._id });
                }
            }
        } catch (pushErr) {
            console.error('⚠️ Push notifications skipped:', pushErr.message);
        }

        res.json({
            success: true,
            message: 'Booking status updated',
            booking,
        });
    } catch (error) {
        console.error('❌ Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add review for booking
// @route   POST /api/v1/bookings/:id/review
exports.addReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings'
            });
        }

        booking.rating = rating;
        booking.review = review;
        await booking.save();

        // Update provider rating
        const provider = await User.findById(booking.providerId);
        const providerBookings = await Booking.find({
            providerId: provider._id,
            rating: { $exists: true, $ne: null }
        });

        if (providerBookings.length > 0) {
            const avgRating = providerBookings.reduce((sum, b) => sum + b.rating, 0) / providerBookings.length;
            provider.providerDetails.rating = avgRating;
            provider.providerDetails.totalReviews = providerBookings.length;
            await provider.save();
        }

        res.json({
            success: true,
            message: 'Review added successfully',
        });
    } catch (error) {
        console.error('❌ Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get booking chat messages
// @route   GET /api/v1/bookings/:id/messages
exports.getBookingMessages = async (req, res) => {
    try {
        const Message = require('../models/Message');
        const messages = await Message.find({ bookingId: req.params.id })
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('❌ Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};