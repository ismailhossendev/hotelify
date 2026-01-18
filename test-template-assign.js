
const mongoose = require('mongoose');
const { Hotel } = require('./src/lib/db/models/Hotel');
const { Template } = require('./src/lib/db/models/Template');

async function testAssign() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primal-supernova');

        // 1. Get Hotel
        const hotel = await Hotel.findOne({});
        if (!hotel) throw new Error("No hotel found");
        console.log(`Testing Hotel: ${hotel.name} (Current Tmpl: ${hotel.templateId})`);

        // 2. Get Different Template
        const oldId = hotel.templateId ? hotel.templateId.toString() : "";
        const template = await Template.findOne({ _id: { $ne: oldId } });
        if (!template) throw new Error("No alternative template found");
        console.log(`Target Template: ${template.name} (${template._id})`);

        // 3. Simulate Update Logic (What the API does)
        const updatedHotel = await Hotel.findByIdAndUpdate(
            hotel._id,
            { templateId: template._id },
            { new: true }
        );

        console.log("Update Result:", updatedHotel.templateId.toString() === template._id.toString() ? "SUCCESS" : "FAILED");
        console.log("New Template ID in DB:", updatedHotel.templateId);

    } catch (e) {
        console.error("Test Failed:", e.message);
    } finally {
        await mongoose.disconnect();
    }
}

testAssign();
