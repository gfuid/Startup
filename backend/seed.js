const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Service = require('./models/Service');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Purana data saaf karo
        await Category.deleteMany();
        await Service.deleteMany();

        // 1. Categories Create Karo
        const categories = await Category.insertMany([
            { name: 'Cleaning', icon: 'brush', description: 'Deep home cleaning' },
            { name: 'Electrical', icon: 'flash', description: 'Repairs and wiring' },
            { name: 'Plumbing', icon: 'water', description: 'Pipe and leak fixes' }
        ]);

        // 2. Services Create Karo
        await Service.insertMany([
            {
                name: 'Full Home Cleaning',
                category: categories[0]._id,
                price: 1500,
                duration: '4-5 Hours',
                image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6954'
            },
            {
                name: 'Fan Repair',
                category: categories[1]._id,
                price: 250,
                duration: '30 Mins',
                image: 'https://images.unsplash.com/photo-1544724569-5f546fa662b5'
            },
            {
                name: 'Tap Leakage Fix',
                category: categories[2]._id,
                price: 200,
                duration: '45 Mins',
                image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a'
            }
        ]);

        console.log('✅ Data Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();