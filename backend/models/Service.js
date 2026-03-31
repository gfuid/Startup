const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    duration: { type: String } // e.g., "1 hour"
});

module.exports = mongoose.model('Service', ServiceSchema);