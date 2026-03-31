const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, address, totalAmount } = req.body;

        const newBooking = new Booking({
            customer: req.user.id, // Auth middleware se milega
            service: serviceId,
            bookingDate,
            address,
            totalAmount
        });

        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all bookings for the logged-in customer
exports.getMyBookings = async (req, res) => {
    try {
        // .populate('service') se humein service ka naam aur price bhi mil jayega
        const bookings = await Booking.find({ customer: req.user.id })
            .populate('service', ['name', 'price', 'image'])
            .sort({ createdAt: -1 }); // Nayi bookings upar dikhayenge

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};