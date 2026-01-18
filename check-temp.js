
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        const count = await mongoose.connection.db.collection('templates').countDocuments();
        console.log(`Templates count: ${count}`);

        const templates = await mongoose.connection.db.collection('templates').find().toArray();
        console.log(templates.map(t => t.name));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
