
const mongoose = require('mongoose');
const { Template } = require('./src/lib/db/models/Template');
const { Hotel } = require('./src/lib/db/models/Hotel');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primal-supernova');

        const templates = await Template.find({});
        console.log(`Found ${templates.length} templates:`);
        templates.forEach(t => console.log(`- ${t.name} (ID: ${t._id})`));

        const hotel = await Hotel.findOne({});
        if (hotel) {
            console.log(`Found Hotel: ${hotel.name} (ID: ${hotel._id}, Current Template: ${hotel.templateId})`);
        } else {
            console.log("No hotels found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
