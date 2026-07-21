const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a service name'],
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['plumbing', 'electrical', 'ac_repair', 'cleaning', 'carpentry', 'painting', 'appliance', 'other'],
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        enum: ['hour', 'visit', 'project'],
        default: 'visit',
    },
    duration: {
        type: String,
        default: '1-2 hours',
    },
    includes: [{
        type: String,
    }],
    image: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Service', serviceSchema);