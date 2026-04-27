const mongoose = require("mongoose");
require("dotenv").config();

async function drop() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    try {
        await db.collection("patients").dropIndex("phoneNumber_1");
        console.log("Index dropped successfully!");
    } catch(err) {
        console.log("Error or index already dropped:", err.message);
    }
    process.exit(0);
}
drop();
