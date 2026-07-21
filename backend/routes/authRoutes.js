// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ✅ Regular routes (without role in URL)
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ Also support role-based routes for compatibility
router.post('/customer/register', registerValidation, (req, res) => {
    req.body.role = 'customer';
    register(req, res);
});
router.post('/customer/login', loginValidation, (req, res) => {
    login(req, res);
});
router.post('/provider/register', registerValidation, (req, res) => {
    req.body.role = 'provider';
    register(req, res);
});
router.post('/provider/login', loginValidation, (req, res) => {
    login(req, res);
});

module.exports = router;