
const mongoose = require('mongoose');
const { Booking } = require('./src/lib/db/models/Booking');

async function checkBooking() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primal-supernova');
        const booking = await Booking.findOne({ bookingNumber: 'BK-750253-858' });
        console.log(JSON.stringify(booking, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkBooking();
