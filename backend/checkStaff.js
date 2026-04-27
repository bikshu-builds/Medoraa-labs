const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Staff = require("./models/Staff");

async function checkAndFixStaff() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const staffList = await Staff.find({});
    
    for (const s of staffList) {
        console.log(`Resetting password for ${s.email} to 'password123'`);
        s.password = await bcrypt.hash("password123", 10);
        await Staff.updateOne({ _id: s._id }, { password: s.password });
    }
    
    console.log("All staff passwords reset to 'password123'");
    mongoose.connection.close();
}

checkAndFixStaff();
