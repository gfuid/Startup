const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    serviceType: { type: String }, // e.g., 'Cleaning', 'Plumbing'
    isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Provider', ProviderSchema);