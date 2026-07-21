// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Get dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProviders,
                totalCustomers,
                totalBookings,
                completedBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user status
router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all bookings
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email')
            .populate('serviceId', 'name price')
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            serviceName: booking.serviceId?.name || booking.customerName || 'Service',
            customerName: booking.customerId?.name || booking.customerName || 'Customer',
            customerPhone: booking.customerId?.phone || booking.customerPhone || 'No phone',
            customerId: booking.customerId,
            providerId: booking.providerId,
            providerName: booking.providerId?.name || 'Searching...',
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            amount: booking.totalAmount,
            status: booking.status,
        }));

        res.json({ success: true, bookings: formattedBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all services
router.get('/services', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create service (admin)
router.post('/services', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update service
router.put('/services/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete service
router.delete('/services/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve/reject provider
router.put('/providers/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user || user.role !== 'provider') {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        if (!user.providerDetails) {
            user.providerDetails = {};
        }
        user.providerDetails.isApproved = isApproved;
        await user.save();

        res.json({
            success: true,
            message: `Provider ${isApproved ? 'approved' : 'rejected'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update booking status (for dispute resolution)
router.put('/bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Notify via socket
        if (global.io) {
            global.io.to(`booking_${booking._id}`).emit('booking_status_changed', {
                bookingId: booking._id,
                status: status
            });
        }

        res.json({ success: true, message: 'Booking status updated by admin', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get dashboard stats with pending bookings
router.get('/stats/pending', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const inProgressBookings = await Booking.countDocuments({ status: 'in_progress' });

        // Weekly bookings for chart (last 7 days)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const start = new Date();
            start.setDate(start.getDate() - i);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            const count = await Booking.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            weeklyData.push({
                day: start.toLocaleDateString('en-US', { weekday: 'short' }),
                date: start.toISOString().split('T')[0],
                count
            });
        }

        res.json({
            success: true,
            stats: { pendingBookings, cancelledBookings, inProgressBookings },
            weeklyData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;