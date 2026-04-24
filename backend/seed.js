const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const Doctor = require("./models/Doctor");
const Employee = require("./models/Employee");
const Patient = require("./models/Patient");
const Test = require("./models/Test");
require("dotenv").config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Admin.deleteMany({});
        await Doctor.deleteMany({});
        await Employee.deleteMany({});
        await Patient.deleteMany({});
        await Test.deleteMany({});

        // Create Admin
        const admin = await Admin.create({
            name: "Super Admin",
            email: "admin@medoraalabs.com",
            password: "adminpassword123" // Will be hashed by pre-save hook
        });
        console.log("Admin created: admin@medoraalabs.com / adminpassword123");

        // Create Tests
        const tests = await Test.create([
            { name: "Full Body Checkup", category: "Full Body Checkup", price: 2999, description: "Comprehensive health screening", preparationInstructions: "10-12 hours fasting required", isPopular: true, tat: "24 Hours", sampleType: "Blood, Urine" },
            { name: "Diabetes Screening", category: "Diabetes", price: 999, description: "Check blood sugar levels", preparationInstructions: "8 hours fasting required", isPopular: true, tat: "12 Hours", sampleType: "Blood" },
            { name: "Thyroid Profile", category: "Thyroid", price: 1299, description: "T3, T4, TSH test", preparationInstructions: "No fasting required", isPopular: true, tat: "24 Hours", sampleType: "Blood" },
            { name: "Vitamin D Test", category: "Vitamins", price: 1500, description: "Check Vitamin D deficiency", preparationInstructions: "No fasting required", tat: "24 Hours", sampleType: "Blood" },
            { name: "CBC (Complete Blood Count)", category: "Blood Tests", price: 499, description: "Basic blood health check", preparationInstructions: "No fasting required", isPopular: true, tat: "12 Hours", sampleType: "Blood" }
        ]);

        // Create Doctors
        const doctors = await Doctor.create([
            { name: "Dr. Rajesh Kumar", hospitalName: "City Hospital", branch: "Main", phoneNumber: "9876543210", email: "rajesh@cityhosp.com", commissionPercentage: 15 },
            { name: "Dr. Anita Sharma", hospitalName: "Lifeline Clinic", branch: "West", phoneNumber: "9876543211", email: "anita@lifeline.com", commissionPercentage: 12 }
        ]);

        // Create Employees
        const employees = await Employee.create([
            { employeeId: "EMP001", name: "Suresh Raina", phoneNumber: "9876543212", email: "suresh@medoraa.com", role: "Lab Staff" },
            { employeeId: "EMP002", name: "Priya Singh", phoneNumber: "9876543213", email: "priya@medoraa.com", role: "Home Collection Staff" }
        ]);

        // Create Patients
        await Patient.create([
            { patientId: "PAT1001", name: "John Doe", phoneNumber: "9876543214", age: 45, gender: "Male", sourceType: "Walk-in", testStatus: "Completed", revenue: 2500 },
            { patientId: "PAT1002", name: "Jane Smith", phoneNumber: "9876543215", age: 32, gender: "Female", sourceType: "Referring Doctor", doctorReferral: doctors[0]._id, testStatus: "Processing", revenue: 4500 }
        ]);

        console.log("Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
