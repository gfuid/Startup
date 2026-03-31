const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// --- Customer Routes ---
router.post('/customer/register', (req, res) => register(req, res, 'customer'));
router.post('/customer/login', (req, res) => login(req, res, 'customer'));

// --- Provider Routes ---
router.post('/provider/register', (req, res) => register(req, res, 'provider'));
router.post('/provider/login', (req, res) => login(req, res, 'provider'));

module.exports = router;