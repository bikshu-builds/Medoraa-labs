require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

// Replace these values with the admin details you want
const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "admin@medoraa.com";
const ADMIN_PASSWORD = "password123";

async function createAdmin() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`Admin with email ${ADMIN_EMAIL} already exists!`);
            process.exit(0);
        }

        // Create new admin
        const newAdmin = new Admin({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // It will be hashed automatically by the pre-save hook in Admin.js
            status: "active"
        });

        await newAdmin.save();
        console.log("Admin created successfully!");
        console.log("Email:", ADMIN_EMAIL);
        console.log("Password:", ADMIN_PASSWORD);
        
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        // Disconnect after operation
        mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

createAdmin();
