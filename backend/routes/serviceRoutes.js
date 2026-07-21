const express = require('express');
const router = express.Router();
const {
    getAllServices,
    getServiceById,
    searchServices,
    getCategories,
} = require('../controllers/serviceController');

router.get('/', getAllServices);
router.get('/search', searchServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);

module.exports = router;