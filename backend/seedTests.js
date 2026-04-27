const mongoose = require("mongoose");
require("dotenv").config();
const Test = require("./models/Test");

const tests = [
    // 1. DIABETES / SUGAR
    { name: "Fasting Blood Glucose", category: "Diabetes / Sugar", description: "Measures blood sugar after fasting", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 150, suggestionTags: ["Diabetes"] },
    { name: "Post Prandial Blood Glucose", category: "Diabetes / Sugar", description: "Measures sugar after food intake", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 150, suggestionTags: ["Diabetes"] },
    { name: "HbA1c", category: "Diabetes / Sugar", description: "Average blood sugar for last 2–3 months", sampleType: "Whole Blood (EDTA)", tat: "Same day", reportTimeHours: 24, price: 400, suggestionTags: ["Diabetes"] },
    { name: "Glucose Tolerance Test (GTT)", category: "Diabetes / Sugar", description: "Checks how body processes glucose over time", sampleType: "Serum + Urine", tat: "Same day", reportTimeHours: 24, price: 300, suggestionTags: ["Diabetes"] },
    { name: "Diabetic Profile (Capsule)", category: "Diabetes / Sugar", description: "Comprehensive diabetes evaluation", sampleType: "Blood + Urine", tat: "Same day", reportTimeHours: 24, price: 900, isPanel: true, suggestionTags: ["Diabetes"] },

    // 2. LIVER (HEPATIC)
    { name: "Liver Function Test (LFT)", category: "Liver (Hepatic)", description: "Assesses liver enzymes and bilirubin", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 600, suggestionTags: ["Age>40"] },
    { name: "LFT – Extended", category: "Liver (Hepatic)", description: "Detailed liver enzyme and protein analysis", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 800, suggestionTags: ["Age>40"] },
    { name: "Liver Master Profile", category: "Liver (Hepatic)", description: "Detects liver-related tumors (AFP, CEA)", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 1500, isPanel: true },
    { name: "Hepatitis Panel", category: "Liver (Hepatic)", description: "Detects viral hepatitis infections", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 2000, isPanel: true },
    { name: "Hepatic Autoimmune Profile", category: "Liver (Hepatic)", description: "Identifies autoimmune liver disorders", sampleType: "Serum", tat: "4 days", reportTimeHours: 96, price: 3500, isPanel: true },

    // 3. KIDNEY / RENAL
    { name: "Renal Function Test (RFT)", category: "Kidney / Renal", description: "Evaluates kidney filtration and electrolyte balance", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 600 },
    { name: "Kidney Profile", category: "Kidney / Renal", description: "Basic kidney health assessment", sampleType: "Serum + Urine", tat: "Same day", reportTimeHours: 24, price: 800, isPanel: true },
    { name: "Dialysis Panel", category: "Kidney / Renal", description: "Monitors patients on dialysis", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 1200, isPanel: true },
    { name: "Nephrotic Syndrome Panel", category: "Kidney / Renal", description: "Detects protein loss and kidney damage", sampleType: "Serum + 24 hr Urine", tat: "Same day", reportTimeHours: 24, price: 1800, isPanel: true },

    // 4. HEART / CARDIAC
    { name: "Cardiac Profile", category: "Heart / Cardiac", description: "Evaluates heart risk and enzyme levels", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 1500, isPanel: true, suggestionTags: ["Age>40"] },
    { name: "Cardiac Enzymes", category: "Heart / Cardiac", description: "Detects heart muscle damage", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 900 },
    { name: "Troponin T / I", category: "Heart / Cardiac", description: "Early marker of heart attack", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 1200 },
    { name: "Coronary Profile", category: "Heart / Cardiac", description: "Assesses cardiovascular disease risk", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 2000, isPanel: true },

    // 5. THYROID / HORMONES
    { name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid / Hormones", description: "Evaluates thyroid gland function", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 500, suggestionTags: ["Female"] },
    { name: "Free Thyroid Profile (FT3, FT4, TSH)", category: "Thyroid / Hormones", description: "Measures active thyroid hormones", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 800 },
    { name: "Hormonal Profile", category: "Thyroid / Hormones", description: "General hormone evaluation", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 1500, isPanel: true },
    { name: "PCOD Profile", category: "Thyroid / Hormones", description: "Diagnoses polycystic ovarian disorder", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 2500, isPanel: true, suggestionTags: ["Female"] },
    { name: "Infertility Profile", category: "Thyroid / Hormones", description: "Evaluates reproductive hormones", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 3000, isPanel: true },

    // 6. INFECTIONS / FEVER
    { name: "Dengue NS1 Antigen", category: "Infections / Fever", description: "Early detection of dengue infection", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 600, suggestionTags: ["Fever"] },
    { name: "Dengue IgG / IgM", category: "Infections / Fever", description: "Detects dengue antibodies", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 800, suggestionTags: ["Fever"] },
    { name: "Widal Test", category: "Infections / Fever", description: "Detects typhoid infection", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 300, suggestionTags: ["Fever"] },
    { name: "Malaria Test", category: "Infections / Fever", description: "Detects malaria parasite", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 200, suggestionTags: ["Fever"] },
    { name: "Fever Profile", category: "Infections / Fever", description: "Comprehensive fever diagnosis panel", sampleType: "Blood + Urine", tat: "72 hours", reportTimeHours: 72, price: 1500, isPanel: true, suggestionTags: ["Fever"] },

    // 7. IMMUNOLOGY / AUTOIMMUNE
    { name: "ANA Profile", category: "Immunology / Autoimmune", description: "Detects autoimmune diseases", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 1200 },
    { name: "Arthritis Panel", category: "Immunology / Autoimmune", description: "Diagnoses rheumatoid conditions", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 2000, isPanel: true },
    { name: "SLE Profile", category: "Immunology / Autoimmune", description: "Detects lupus (autoimmune disease)", sampleType: "Blood", tat: "Same day", reportTimeHours: 24, price: 2500, isPanel: true },

    // 8. MICROBIOLOGY
    { name: "Blood Culture", category: "Microbiology", description: "Detects bloodstream infections", sampleType: "Whole Blood", tat: "1–5 days", reportTimeHours: 120, price: 800 },
    { name: "Urine Culture", category: "Microbiology", description: "Detects urinary infections", sampleType: "Urine", tat: "1–5 days", reportTimeHours: 120, price: 600 },
    { name: "Sputum Culture", category: "Microbiology", description: "Detects lung infections", sampleType: "Sputum", tat: "1–5 days", reportTimeHours: 120, price: 700 },
    { name: "Fungal Culture", category: "Microbiology", description: "Detects fungal infections", sampleType: "Body fluid", tat: "Up to 21 days", reportTimeHours: 504, price: 1000 },

    // 9. GENERAL HEALTH PROFILES
    { name: "Master Health Profile", category: "General Health Profiles", description: "Full body health screening", sampleType: "Blood + Urine", tat: "Same day", reportTimeHours: 24, price: 2999, isPanel: true },
    { name: "60 Parameter Health Profile", category: "General Health Profiles", description: "Advanced full body checkup", sampleType: "Blood + Urine", tat: "Same day", reportTimeHours: 24, price: 3999, isPanel: true },
    { name: "Zed Health Profile", category: "General Health Profiles", description: "Comprehensive diagnostic package", sampleType: "Blood + Urine", tat: "Same day", reportTimeHours: 24, price: 4999, isPanel: true },

    // 10. CANCER MARKERS
    { name: "PSA (Prostate)", category: "Cancer Markers", description: "Detects prostate cancer risk", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 800, suggestionTags: ["Men", "Age>40"] },
    { name: "AFP", category: "Cancer Markers", description: "Detects liver cancer markers", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 1000 },
    { name: "CA-125", category: "Cancer Markers", description: "Detects ovarian cancer markers", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 1200, suggestionTags: ["Female"] },
    { name: "CEA", category: "Cancer Markers", description: "General cancer marker", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 900 },

    // 11. BONE / MINERAL
    { name: "Calcium", category: "Bone / Mineral", description: "Measures calcium levels", sampleType: "Serum", tat: "Same day", reportTimeHours: 24, price: 200 },
    { name: "Vitamin D", category: "Bone / Mineral", description: "Assesses bone health and deficiency", sampleType: "Serum", tat: "96 hours", reportTimeHours: 96, price: 1200 },
    { name: "Osteoporosis Profile", category: "Bone / Mineral", description: "Evaluates bone density markers", sampleType: "Serum", tat: "72 hours", reportTimeHours: 72, price: 2500, isPanel: true },

    // 12. URINE / STOOL
    { name: "Urine Routine Examination", category: "Urine / Stool", description: "Basic urine analysis", sampleType: "Urine", tat: "Same day", reportTimeHours: 24, price: 150 },
    { name: "Stool Examination", category: "Urine / Stool", description: "Detects digestive issues/infections", sampleType: "Stool", tat: "Same day", reportTimeHours: 24, price: 200 }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Seeding");

        // Clear existing tests to prevent duplicates or old enum errors
        await Test.deleteMany({});
        console.log("Cleared existing tests");

        // Insert new tests
        await Test.insertMany(tests);
        console.log(`Seeded ${tests.length} tests successfully!`);

        mongoose.connection.close();
    } catch (err) {
        console.error("Seeding Error:", err);
        mongoose.connection.close();
    }
};

seedDB();
