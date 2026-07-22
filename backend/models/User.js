const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['customer', 'provider', 'admin'],
        default: 'customer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profileImage: {
        type: String,
        default: '',
    },
    expoPushToken: {
        type: String,
        default: '',
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    providerDetails: {
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        }],
        experience: String,
        shopName: {
            type: String,
            default: '',
        },
        ownerName: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        workingHours: {
            type: String,
            default: '9:00 AM - 8:00 PM',
        },
        weeklyOff: {
            type: String,
            default: 'Sunday',
        },
        bio: {
            type: String,
            default: '',
        },
        rateCard: [{
            serviceName: { type: String, required: true },
            price: { type: Number, required: true },
            unit: { type: String, default: 'per job' }
        }],
        upiId: {
            type: String,
            default: '',
        },
        bankAccountDetails: {
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            bankName: { type: String, default: '' },
            accountHolderName: { type: String, default: '' },
        },
        isPaymentVerified: {
            type: Boolean,
            default: false,
        },
        xpPoints: {
            type: Number,
            default: 1850,
        },
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold'],
            default: 'gold',
        },
        rank: {
            type: Number,
            default: 2,
        },
        badges: [{
            title: String,
            icon: String,
            earnedAt: Date,
        }],
        gstNumber: {
            type: String,
            default: '',
        },
        businessRegistrationNumber: {
            type: String,
            default: '',
        },
        bannerImage: {
            type: String,
            default: '',
        },
        aadhaarNumber: {
            type: String,
            default: '',
        },
        aadhaarCardImage: {
            type: String,
            default: '',
        },
        documents: [{
            type: String,
            url: String,
        }],
        isApproved: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
    },
    resetPasswordCode: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);