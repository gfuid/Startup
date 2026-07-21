// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// backend/controllers/authController.js - Make sure phone is handled
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, password, role = 'customer' } = req.body;

        // ✅ Add phone to check
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create user with phone
        const user = await User.create({
            name,
            email,
            phone, // ✅ Make sure phone is saved
            password,
            role,
            isVerified: true,
            isActive: true,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone, // ✅ Return phone
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                providerDetails: user.providerDetails, // ✅ Return providerDetails
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update profile
// @route   PUT /api/v1/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, isOnline, expoPushToken } = req.body;

        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (expoPushToken) user.expoPushToken = expoPushToken;
        if (isOnline !== undefined) {
            if (!user.providerDetails) {
                user.providerDetails = {};
            }
            user.providerDetails.isOnline = isOnline;
        }

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Forgot password — verify identity
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and phone number'
            });
        }

        const user = await User.findOne({ email, phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email and phone combination'
            });
        }

        // Generate a simple reset token (6-digit code)
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // In production, send this code via SMS/Email
        console.log(`🔑 Password reset code for ${email}: ${resetCode}`);

        res.json({
            success: true,
            message: 'Identity verified. You can now reset your password.',
            // In production, remove resetCode from response — send via SMS instead
            resetCode,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Reset password with code
// @route   POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, reset code, and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findOne({
            email,
            resetPasswordCode: resetCode,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        user.password = newPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};