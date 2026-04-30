const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Patient = require("./models/Patient");
const dotenv = require("dotenv");

dotenv.config();

async function checkPatientAddresses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const bookingIds = ["69f16735f060ea57bbefe2ac", "69f2464c08967a1a3e7d42ea", "69f3a430fbf44ac19cf10ad6"];
        const bookings = await Booking.find({ _id: { $in: bookingIds } }).populate("patient");

        for (const b of bookings) {
            console.log(`Booking ${b.bookingId}: Patient ${b.patient?.name}, Addresses: ${b.patient?.addresses?.length || 0}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkPatientAddresses();
