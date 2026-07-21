// seed.js - ENHANCED VERSION with multiple providers, more services, and sample bookings
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in .env file. Please add MONGO_URI or MONGODB_URI');
        }
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Models
const userSchema = new mongoose.Schema({
    name: String, email: String, phone: String, password: String, role: String,
    isVerified: Boolean, isActive: Boolean,
    profileImage: String,
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
        services: [String], experience: String, isApproved: Boolean,
        isOnline: Boolean, rating: Number, totalReviews: Number,
        shopName: String,
        ownerName: String,
        description: String,
        workingHours: String,
        weeklyOff: String,
        upiId: String,
        gstNumber: String,
        businessRegistrationNumber: String,
        bannerImage: String,
        aadhaarNumber: String,
        aadhaarCardImage: String,
    },
    createdAt: { type: Date, default: Date.now },
});

const serviceSchema = new mongoose.Schema({
    name: String, category: String, description: String, price: Number,
    duration: String, includes: [String], rating: Number, reviews: Number,
    featured: Boolean, isActive: Boolean, createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    customerName: String, customerPhone: String,
    status: String, scheduledDate: Date, scheduledTime: String,
    address: { street: String, city: String, pincode: String, fullAddress: String },
    notes: String, totalAmount: Number, paymentMethod: String, paymentStatus: String,
    rating: Number, review: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const Booking = mongoose.model('Booking', bookingSchema);

const sampleServices = [
    {
        name: 'Premium Plumbing Service',
        category: 'plumbing',
        description: 'Complete plumbing solution for your home. Includes pipe repair, leakage fix, and installation.',
        price: 399, duration: '1-2 hours',
        includes: ['Pipe inspection', 'Leakage repair', 'Taps installation', '30-day warranty'],
        rating: 4.8, reviews: 234, featured: true, isActive: true,
    },
    {
        name: 'Electrical Repair',
        category: 'electrical',
        description: 'Professional electrical services including wiring, switch repair, and circuit checks.',
        price: 499, duration: '1-2 hours',
        includes: ['Wiring check', 'Switch repair', 'Circuit testing', 'Safety inspection'],
        rating: 4.9, reviews: 189, featured: true, isActive: true,
    },
    {
        name: 'AC Service & Repair',
        category: 'ac_repair',
        description: 'Complete AC maintenance, gas refilling, and repair services.',
        price: 599, duration: '1.5-2 hours',
        includes: ['AC cleaning', 'Gas refilling', 'Filter replacement', 'Performance check'],
        rating: 4.7, reviews: 156, featured: true, isActive: true,
    },
    {
        name: 'Home Deep Cleaning',
        category: 'cleaning',
        description: 'Professional deep cleaning service for your home including kitchen, bathroom, and living area.',
        price: 299, duration: '2-3 hours',
        includes: ['Floor cleaning', 'Bathroom cleaning', 'Kitchen cleaning', 'Window cleaning'],
        rating: 4.6, reviews: 98, featured: true, isActive: true,
    },
    {
        name: 'Carpentry Work',
        category: 'carpentry',
        description: 'Custom furniture repair, installation, and woodwork by expert carpenters.',
        price: 449, duration: '2-3 hours',
        includes: ['Furniture repair', 'Cabinet installation', 'Wood polishing', 'Door fixing'],
        rating: 4.8, reviews: 67, featured: false, isActive: true,
    },
    {
        name: 'Professional Painting',
        category: 'painting',
        description: 'Professional wall painting and texture work for beautiful interiors.',
        price: 899, duration: '3-4 hours',
        includes: ['Wall preparation', 'Primer coating', 'Paint application', 'Touch-ups'],
        rating: 4.5, reviews: 45, featured: false, isActive: true,
    },
    {
        name: 'Appliance Installation',
        category: 'appliance',
        description: 'Expert installation of home appliances - washing machines, geysers, chimneys.',
        price: 349, duration: '1-2 hours',
        includes: ['Unboxing & setup', 'Wall mounting', 'Connection check', 'Demo & walkthrough'],
        rating: 4.6, reviews: 78, featured: true, isActive: true,
    },
    {
        name: 'Pest Control Treatment',
        category: 'other',
        description: 'Complete pest control solution for cockroaches, ants, termites, and mosquitoes.',
        price: 699, duration: '2-3 hours',
        includes: ['Full home spray', 'Gel treatment', 'Termite check', '60-day protection'],
        rating: 4.4, reviews: 112, featured: false, isActive: true,
    },
    {
        name: 'Smart Fan & Light Installation',
        category: 'electrical',
        description: 'Install smart fans, decorative lights, and modular switches with IoT compatibility.',
        price: 649, duration: '1.5-2 hours',
        includes: ['Smart switch setup', 'Fan installation', 'Light fitting', 'Remote configuration'],
        rating: 4.7, reviews: 52, featured: false, isActive: true,
    },
];

const generateMockAadhaarSVG = (name, number, address) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
        <rect width="400" height="250" rx="15" fill="#fcf8f2" stroke="#e2d4c0" stroke-width="3"/>
        <rect width="400" height="40" fill="#e05a47"/>
        <text x="20" y="26" fill="white" font-family="sans-serif" font-size="14" font-weight="bold">GOVERNMENT OF INDIA / भारत सरकार</text>
        <circle cx="55" cy="115" r="35" fill="#ccc" stroke="#999" stroke-width="2"/>
        <text x="55" y="125" font-family="sans-serif" font-size="36" fill="#666" text-anchor="middle">👤</text>
        <text x="110" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#333">Name: ${name}</text>
        <text x="110" y="110" font-family="sans-serif" font-size="11" fill="#555">DOB: 15/08/1990 | Gender: Male</text>
        <text x="110" y="130" font-family="sans-serif" font-size="10" fill="#555">Address: ${address}</text>
        <line x1="20" y1="170" x2="380" y2="170" stroke="#ccc" stroke-width="1"/>
        <text x="200" y="205" font-family="sans-serif" font-size="22" font-weight="bold" fill="#222" letter-spacing="4" text-anchor="middle">${number}</text>
        <text x="200" y="230" font-family="sans-serif" font-size="9" fill="#e05a47" font-weight="bold" text-anchor="middle">Aadhaar - Mera Aadhaar, Meri Pehchan</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const generateMockAvatarSVG = (name, color) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="${color || '#3b82f6'}"/>
        <text x="50" y="58" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const generateMockBannerSVG = (shopName, category) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e1b4b"/>
                <stop offset="100%" stop-color="#311042"/>
            </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#g)"/>
        <circle cx="700" cy="100" r="150" fill="#4f46e5" opacity="0.15"/>
        <circle cx="100" cy="300" r="100" fill="#06b6d4" opacity="0.1"/>
        <text x="50" y="160" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="600" letter-spacing="2">${category}</text>
        <text x="50" y="230" fill="white" font-family="sans-serif" font-size="44" font-weight="bold">${shopName}</text>
        <text x="50" y="280" fill="#94a3b8" font-family="sans-serif" font-size="18">Professional Home Services &amp; Solutions</text>
        <rect x="50" y="320" width="160" height="40" rx="8" fill="#4f46e5"/>
        <text x="130" y="345" fill="white" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">VERIFIED SHOP</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const importData = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Service.deleteMany({});
        await User.deleteMany({});
        await Booking.deleteMany({});

        console.log('📦 Importing services...');
        const services = await Service.insertMany(sampleServices);
        console.log(`✅ Imported ${services.length} services`);

        console.log('👤 Creating test users...');

        // Hash passwords
        const providerPassword = await bcrypt.hash('Provider@123', 10);
        const customerPassword = await bcrypt.hash('Customer@123', 10);
        const adminPassword = await bcrypt.hash('Admin@123', 10);

        // Create providers
        const provider1 = await User.create({
            name: 'Sagar Plumbing Works',
            email: 'provider@servicehub.com',
            phone: '9876543210',
            password: providerPassword,
            role: 'provider',
            isVerified: true, isActive: true,
            profileImage: generateMockAvatarSVG('Sagar Plumbing Works', '#ef4444'),
            address: {
                street: '123 MG Road, Sector 4',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            providerDetails: {
                services: services.map(s => s.name),
                experience: '5 years',
                isApproved: true, isOnline: true,
                rating: 4.8, totalReviews: 234,
                shopName: 'Sagar Plumbing Works',
                ownerName: 'Sagar Kumar',
                description: 'We provide all kinds of plumbing services, leak fixes, pipe installations with a 30-day warranty.',
                workingHours: '9:00 AM - 7:00 PM',
                weeklyOff: 'Sunday',
                upiId: 'sagarplumbing@okaxis',
                gstNumber: '29AAAAA1111A1Z1',
                businessRegistrationNumber: 'REG-PLUM-987',
                bannerImage: generateMockBannerSVG('Sagar Plumbing Works', 'Plumbing'),
                aadhaarNumber: '3847 2948 1039',
                aadhaarCardImage: generateMockAadhaarSVG('Sagar Plumbing Works', '3847 2948 1039', '123 MG Road, Sector 4, Bangalore, KA - 560001'),
            },
        });
        console.log(`✅ Provider created: ${provider1.email}`);

        const provider2 = await User.create({
            name: 'Rajesh Electric Solutions',
            email: 'rajesh.electric@servicehub.com',
            phone: '9876543220',
            password: providerPassword,
            role: 'provider',
            isVerified: true, isActive: true,
            profileImage: generateMockAvatarSVG('Rajesh Electric Solutions', '#eab308'),
            address: {
                street: '456 Brigade Road',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560025',
                coordinates: { lat: 12.9622, lng: 77.6080 }
            },
            providerDetails: {
                services: ['Electrical Repair', 'Smart Fan & Light Installation', 'Appliance Installation'],
                experience: '8 years',
                isApproved: true, isOnline: true,
                rating: 4.9, totalReviews: 189,
                shopName: 'Rajesh Electric Solutions',
                ownerName: 'Rajesh Sharma',
                description: 'Specialized in home wiring, appliance installations, smart lights, and complete electric safety checks.',
                workingHours: '8:00 AM - 8:00 PM',
                weeklyOff: 'None',
                upiId: 'rajeshelectric@okaxis',
                gstNumber: '29BBBBB2222B2Z2',
                businessRegistrationNumber: 'REG-ELEC-456',
                bannerImage: generateMockBannerSVG('Rajesh Electric Solutions', 'Electrical'),
                aadhaarNumber: '7384 9204 8173',
                aadhaarCardImage: generateMockAadhaarSVG('Rajesh Electric Solutions', '7384 9204 8173', '456 Brigade Road, Bangalore, KA - 560025'),
            },
        });
        console.log(`✅ Provider created: ${provider2.email}`);

        const provider3 = await User.create({
            name: 'CleanHome Services',
            email: 'cleanhome@servicehub.com',
            phone: '9876543230',
            password: providerPassword,
            role: 'provider',
            isVerified: true, isActive: true,
            profileImage: generateMockAvatarSVG('CleanHome Services', '#10b981'),
            address: {
                street: '789 Koramangala 5th Block',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560034',
                coordinates: { lat: 12.9348, lng: 77.6206 }
            },
            providerDetails: {
                services: ['Home Deep Cleaning', 'Pest Control Treatment'],
                experience: '3 years',
                isApproved: true, isOnline: false,
                rating: 4.6, totalReviews: 98,
                shopName: 'CleanHome Services',
                ownerName: 'Anil Verma',
                description: 'Complete professional deep cleaning for apartments and offices. Pest control and disinfection services.',
                workingHours: '7:00 AM - 6:00 PM',
                weeklyOff: 'Monday',
                upiId: 'cleanhome@okaxis',
                gstNumber: '29CCCCC3333C3Z3',
                businessRegistrationNumber: 'REG-CLEAN-321',
                bannerImage: generateMockBannerSVG('CleanHome Services', 'Cleaning'),
                aadhaarNumber: '4938 1029 3847',
                aadhaarCardImage: generateMockAadhaarSVG('CleanHome Services', '4938 1029 3847', '789 Koramangala 5th Block, Bangalore, KA - 560034'),
            },
        });
        console.log(`✅ Provider created: ${provider3.email}`);

        const provider4 = await User.create({
            name: 'CoolAir AC Repairs',
            email: 'coolair@servicehub.com',
            phone: '9876543240',
            password: providerPassword,
            role: 'provider',
            isVerified: true, isActive: true,
            profileImage: generateMockAvatarSVG('CoolAir AC Repairs', '#3b82f6'),
            address: {
                street: '45 Indiranagar 100 Feet Road',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560038',
                coordinates: { lat: 12.9640, lng: 77.6384 }
            },
            providerDetails: {
                services: ['AC Service & Repair', 'Appliance Installation'],
                experience: '6 years',
                isApproved: false, isOnline: false, // Pending approval
                rating: 0, totalReviews: 0,
                shopName: 'CoolAir AC Repairs',
                ownerName: 'Vikram Singh',
                description: 'AC installation, gas filling, filter cleanup, and cooling issue troubleshooting by experienced techs.',
                workingHours: '9:30 AM - 7:30 PM',
                weeklyOff: 'Sunday',
                upiId: 'coolair@okaxis',
                gstNumber: '29DDDDD4444D4Z4',
                businessRegistrationNumber: 'REG-AC-852',
                bannerImage: generateMockBannerSVG('CoolAir AC Repairs', 'AC Repair'),
                aadhaarNumber: '5839 2049 1847',
                aadhaarCardImage: generateMockAadhaarSVG('CoolAir AC Repairs', '5839 2049 1847', '45 Indiranagar 100 Feet Road, Bangalore, KA - 560038'),
            },
        });
        console.log(`✅ Provider created: ${provider4.email} (Pending Approval)`);

        // Create customers
        const customer1 = await User.create({
            name: 'Sagar Customer',
            email: 'customer@test.com',
            phone: '9876543211',
            password: customerPassword,
            role: 'customer',
            isVerified: true, isActive: true,
        });
        console.log(`✅ Customer created: ${customer1.email}`);

        const customer2 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@test.com',
            phone: '9876543215',
            password: customerPassword,
            role: 'customer',
            isVerified: true, isActive: true,
        });
        console.log(`✅ Customer created: ${customer2.email}`);

        // Create admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@servicehub.com',
            phone: '9876543212',
            password: adminPassword,
            role: 'admin',
            isVerified: true, isActive: true,
        });
        console.log(`✅ Admin created: ${admin.email}`);

        // Create sample bookings
        console.log('📋 Creating sample bookings...');
        const now = new Date();

        const sampleBookings = [
            {
                customerId: customer1._id,
                providerId: provider1._id,
                serviceId: services[0]._id,
                customerName: customer1.name,
                customerPhone: customer1.phone,
                status: 'completed',
                scheduledDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                scheduledTime: '10:00 AM',
                address: { fullAddress: '123 MG Road, Bangalore - 560001', street: '123 MG Road', city: 'Bangalore', pincode: '560001' },
                notes: 'Kitchen sink leakage',
                totalAmount: 399,
                paymentStatus: 'paid',
                rating: 5,
                review: 'Excellent service! Fixed the leak quickly.',
                createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            },
            {
                customerId: customer1._id,
                providerId: provider2._id,
                serviceId: services[1]._id,
                customerName: customer1.name,
                customerPhone: customer1.phone,
                status: 'accepted',
                scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
                scheduledTime: '2:00 PM',
                address: { fullAddress: '456 Brigade Road, Bangalore - 560025', street: '456 Brigade Road', city: 'Bangalore', pincode: '560025' },
                notes: 'Switch board issue in bedroom',
                totalAmount: 499,
                paymentStatus: 'pending',
                createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            },
            {
                customerId: customer2._id,
                providerId: provider3._id,
                serviceId: services[3]._id,
                customerName: customer2.name,
                customerPhone: customer2.phone,
                status: 'pending',
                scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                scheduledTime: '9:00 AM',
                address: { fullAddress: '789 Koramangala, Bangalore - 560034', street: '789 Koramangala', city: 'Bangalore', pincode: '560034' },
                notes: 'Full home deep cleaning',
                totalAmount: 299,
                paymentStatus: 'pending',
                createdAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000),
            },
            {
                customerId: customer2._id,
                providerId: provider1._id,
                serviceId: services[2]._id,
                customerName: customer2.name,
                customerPhone: customer2.phone,
                status: 'completed',
                scheduledDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                scheduledTime: '11:00 AM',
                address: { fullAddress: '45 Indiranagar, Bangalore - 560038', street: '45 Indiranagar', city: 'Bangalore', pincode: '560038' },
                notes: 'AC not cooling properly',
                totalAmount: 599,
                paymentStatus: 'paid',
                rating: 4,
                review: 'Good service, gas refilled and AC is working well now.',
                createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            },
            {
                customerId: customer1._id,
                providerId: provider1._id,
                serviceId: services[4]._id,
                customerName: customer1.name,
                customerPhone: customer1.phone,
                status: 'cancelled',
                scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                scheduledTime: '4:00 PM',
                address: { fullAddress: '12 JP Nagar, Bangalore - 560078', street: '12 JP Nagar', city: 'Bangalore', pincode: '560078' },
                notes: 'Cabinet door hinge broken',
                totalAmount: 449,
                paymentStatus: 'pending',
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            },
        ];

        const bookings = await Booking.insertMany(sampleBookings);
        console.log(`✅ Created ${bookings.length} sample bookings`);

        console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔵 CUSTOMER:');
        console.log('   Email: customer@test.com');
        console.log('   Password: Customer@123');
        console.log('   (Also: priya@test.com / Customer@123)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🟢 PROVIDER:');
        console.log('   Email: provider@servicehub.com');
        console.log('   Password: Provider@123');
        console.log('   (Also: rajesh.electric@servicehub.com)');
        console.log('   (Also: cleanhome@servicehub.com)');
        console.log('   (Also: coolair@servicehub.com — Pending Approval)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔴 ADMIN:');
        console.log('   Email: admin@servicehub.com');
        console.log('   Password: Admin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

importData();