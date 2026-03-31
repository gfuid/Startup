const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Service = require('../models/Service');

// @route  GET api/v1/services/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route  GET api/v1/services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().populate('category', ['name']);
        res.json(services);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;