const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @desc    Get reviews for a specific provider
// @route   GET /api/v1/reviews/provider/:providerId
router.get('/provider/:providerId', async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
        const total = reviews.length;
        const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';

        res.json({
            success: true,
            total,
            avgRating: parseFloat(avgRating),
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create a new customer review
// @route   POST /api/v1/reviews
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { bookingId, providerId, rating, comment } = req.body;

        if (!providerId || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'Please provide rating, comment and provider ID.' });
        }

        const newReview = await Review.create({
            bookingId: bookingId || new mongoose.Types.ObjectId(),
            providerId,
            customerId: req.user.id,
            customerName: req.user.name || 'Verified Customer',
            rating: Number(rating),
            comment,
        });

        // Recalculate provider average rating
        const allReviews = await Review.find({ providerId });
        const avgRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1);

        await User.findByIdAndUpdate(providerId, {
            'providerDetails.rating': parseFloat(avgRating),
            'providerDetails.totalReviews': allReviews.length,
        });

        res.status(201).json({
            success: true,
            review: newReview,
            message: 'Review submitted successfully!'
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
