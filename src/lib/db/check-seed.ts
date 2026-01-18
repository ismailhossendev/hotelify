import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { SiteConfig } from './models/SiteConfig';

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');
        const config = await SiteConfig.findOne();
        console.log('Config exists:', !!config);
        if (config) {
            console.log('Categories items:', config.categories?.items?.length);
            console.log('Destinations items:', config.destinations?.items?.length);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
