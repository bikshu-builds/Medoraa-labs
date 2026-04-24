const mongoose = require("mongoose");
const Staff = require("./models/Staff");
const Booking = require("./models/Booking");
const Patient = require("./models/Patient");
const Test = require("./models/Test");
const Collection = require("./models/Collection");
require("dotenv").config();

const seedStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for staff seeding...");

        await Staff.deleteMany({});
        await Collection.deleteMany({});

        // Create Staff Members
        const staffData = [
            { staffId: "STF-001", name: "John Pathologist", email: "pathologist@medoraa.com", password: "password123", phoneNumber: "9000000001", role: "Report Approval Team" },
            { staffId: "STF-002", name: "Alice Collector", email: "collector@medoraa.com", password: "password123", phoneNumber: "9000000002", role: "Sample Collection Team" },
            { staffId: "STF-003", name: "Bob Technician", email: "tech@medoraa.com", password: "password123", phoneNumber: "9000000003", role: "Sample Processing Team" },
            { staffId: "STF-004", name: "Sarah Reception", email: "reception@medoraa.com", password: "password123", phoneNumber: "9000000004", role: "Reception" },
            { staffId: "STF-005", name: "Mike Dispatch", email: "dispatch@medoraa.com", password: "password123", phoneNumber: "9000000005", role: "Dispatch Team" },
            { staffId: "STF-006", name: "Admin User", email: "staffadmin@medoraa.com", password: "password123", phoneNumber: "9000000006", role: "Admin Staff" }
        ];

        const createdStaff = await Staff.create(staffData);
        console.log("Staff members created successfully!");

        // Create some sample collections for Alice
        const collector = createdStaff.find(s => s.role === "Sample Collection Team");
        const patient = await Patient.findOne();
        const test = await Test.findOne();
        const booking = await Booking.findOne() || await Booking.create({
            bookingId: "BK-999999",
            patient: patient._id,
            patientName: patient.name,
            tests: [test._id],
            date: new Date(),
            time: "10:00 AM",
            bookingType: "Home Collection",
            totalAmount: 1500,
            status: "Scheduled"
        });

        await Collection.create([
            {
                booking: booking._id,
                assignedStaff: collector._id,
                scheduledDate: new Date(),
                timeSlot: "09:00 - 10:00 AM",
                status: "Assigned",
                location: { coordinates: [77.5946, 12.9716] }
            },
            {
                booking: booking._id,
                assignedStaff: collector._id,
                scheduledDate: new Date(),
                timeSlot: "11:00 - 12:00 PM",
                status: "On the way",
                location: { coordinates: [77.6146, 12.9916] }
            }
        ]);

        console.log("Sample collections created!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedStaff();
