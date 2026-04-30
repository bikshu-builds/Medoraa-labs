const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Collection = require("./models/Collection");
const dotenv = require("dotenv");

dotenv.config();

async function checkOrphanHomeCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const homeCollectionBookings = await Booking.find({ sourceType: "Home Collection" });
        console.log(`Found ${homeCollectionBookings.length} Home Collection bookings.`);

        for (const booking of homeCollectionBookings) {
            const collection = await Collection.findOne({ booking: booking._id });
            if (!collection) {
                console.log(`Booking ${booking.bookingId} (${booking._id}) has NO Collection record!`);
            } else {
                console.log(`Booking ${booking.bookingId} has Collection record.`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkOrphanHomeCollections();
