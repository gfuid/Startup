// backend/models/Booking.js - ADD THESE FIELDS
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    // ✅ ADD THESE FIELDS
    customerName: {
        type: String,
        default: '',
    },
    customerPhone: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
    },
    scheduledDate: {
        type: Date,
        required: true,
    },
    scheduledTime: {
        type: String,
        required: true,
    },
    address: {
        street: String,
        city: String,
        pincode: String,
        fullAddress: String,
        latitude: Number,
        longitude: Number,
    },
    notes: {
        type: String,
        default: '',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        default: 'cash',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    paymentDetails: {
        orderId: String,
        paymentId: String,
        verifiedAt: Date,
    },
    cancellationReason: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    review: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);