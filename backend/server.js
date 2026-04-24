require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require("./routes/admin");
const patientRoutes = require("./routes/patient");
const staffRoutes = require("./routes/staff");
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/staff", staffRoutes);

app.get("/", (req, res) => {
    res.send("Health route is working bro");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
