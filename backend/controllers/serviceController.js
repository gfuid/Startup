const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/v1/services
exports.getAllServices = async (req, res) => {
    try {
        const { limit = 10, category, featured } = req.query;

        let query = { isActive: true };
        if (category) query.category = category;
        if (featured === 'true') query.featured = true;

        const services = await Service.find(query)
            .limit(parseInt(limit))
            .sort({ rating: -1, featured: -1 });

        res.json({
            success: true,
            count: services.length,
            services,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single service
// @route   GET /api/v1/services/:id
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({
            success: true,
            service,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Search services
// @route   GET /api/v1/services/search
exports.searchServices = async (req, res) => {
    try {
        const { q } = req.query;

        const services = await Service.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ],
            isActive: true
        });

        res.json({
            success: true,
            count: services.length,
            services,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get categories
// @route   GET /api/v1/services/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Service.distinct('category');

        res.json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};