require("dotenv").config();
const mongoose = require("mongoose");
const Hospital = require("./models/Hospital");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for seeding...");

        // Remove any old ones if they exist with the same login username
        await Hospital.deleteMany({ loginUsername: "carehospital" });

        const newHospital = new Hospital({
            name: "Care Hospital",
            branchName: "City Center",
            contactPerson: "Dr. Ananya Reddy",
            phoneNumber: "9876543210",
            email: "partner@carehospital.com",
            address: "Opposite High Court, Jubilee Hills, Hyderabad",
            gstNumber: "36AAAAA0000A1Z5",
            loginUsername: "carehospital",
            password: "Password123", // Pre-save hook hashes this!
            status: "Active",
            creditLimit: 50000,
            billingCycle: "Monthly",
            hospitalCode: "CARE001",
            agreementType: "Fixed Tier Pricing"
        });

        await newHospital.save();
        console.log("Care Hospital Partner seeded successfully!");
        console.log("-----------------------------------------");
        console.log("Login Username: carehospital");
        console.log("Password: Password123");
        console.log("Hospital Code: CARE001");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
