const mongoose = require('mongoose');
require('./models/Test');

async function update() {
    await mongoose.connect('mongodb+srv://medoraalabs:medoraalabs@cluster0.r9eoefg.mongodb.net/?appName=Cluster0');
    
    const updates = [
        { name: 'Fasting Blood Glucose', params: ['Blood Glucose (Fasting)'] },
        { name: 'HbA1c', params: ['HbA1c (Glycated Hemoglobin)'] },
        { name: 'Thyroid Profile', params: ['T3', 'T4', 'TSH'] },
        { name: 'Diabetic Profile (Capsule)', params: ['Fasting Glucose', 'HbA1c', 'Urine Glucose'] }
    ];

    for (const u of updates) {
        await mongoose.model('Test').updateOne({ name: u.name }, { $set: { parameters: u.params } });
    }

    console.log('Parameters updated successfully');
    process.exit();
}

update();
