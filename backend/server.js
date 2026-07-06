require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("Health route is working bro");
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "API is healthy" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        // Safe database migration for legacy doctor schema ('hospital' -> 'hospitalId')
        try {
            const db = mongoose.connection.db;
            const result = await db.collection("doctors").updateMany(
                { hospital: { $exists: true }, hospitalId: { $exists: false } },
                [
                    { $set: { hospitalId: "$hospital" } },
                    { $unset: ["hospital"] }
                ]
            );
            if (result.modifiedCount > 0) {
                console.log(`[Migration] Renamed 'hospital' to 'hospitalId' in ${result.modifiedCount} doctor records.`);
            }
        } catch (migrationErr) {
            console.error("[Migration] Error migrating legacy doctor records:", migrationErr);
        }

        // Drop legacy unique index on samples collection if it exists
        try {
            const db = mongoose.connection.db;
            const collections = await db.listCollections({ name: "samples" }).toArray();
            if (collections.length > 0) {
                const indexes = await db.collection("samples").indexes();
                const hasSampleIdIndex = indexes.some(idx => idx.name === "sampleId_1");
                if (hasSampleIdIndex) {
                    await db.collection("samples").dropIndex("sampleId_1");
                    console.log("[Migration] Successfully dropped legacy unique 'sampleId_1' index from samples collection.");
                }
            }
        } catch (indexErr) {
            console.error("[Migration] Error dropping legacy sample index:", indexErr);
        }
    })
    .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
