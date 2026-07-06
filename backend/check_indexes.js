const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to Mongo Atlas");
        const db = mongoose.connection.db;
        const indexes = await db.collection("samples").indexes();
        console.log("Indexes on samples collection:", indexes);
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
