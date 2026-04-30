const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Collection = require("./models/Collection");
const dotenv = require("dotenv");

dotenv.config();

async function repairCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const bookings = await Booking.find({ 
            sourceType: "Home Collection",
            status: { $ne: "Completed" }
        });

        console.log(`Found ${bookings.length} Home Collection bookings.`);

        let count = 0;
        for (const booking of bookings) {
            const existing = await Collection.findOne({ booking: booking._id });
            if (!existing) {
                const collection = new Collection({
                    booking: booking._id,
                    scheduledDate: booking.date || new Date(),
                    timeSlot: booking.time || "Morning (08:00 - 10:00)",
                    status: "Order Received",
                    location: {
                        type: "Point",
                        coordinates: [78.4867, 17.3850] // Default: Hyderabad center
                    }
                });
                await collection.save();
                console.log(`Repaired: Created Collection record for Booking ${booking.bookingId}`);
                count++;
            }
        }

        console.log(`Repair completed. ${count} records created.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

repairCollections();
