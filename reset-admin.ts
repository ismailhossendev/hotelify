import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
import dbConnect from './src/lib/db/connect';
import { User } from './src/lib/db/models/User'; // Adjust path if needed
import bcrypt from 'bcryptjs';

async function resetAdmin() {
    try {
        await dbConnect();
        console.log('Connecting to DB...');

        const email = 'admin@hotelify.com';
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found user: ${user.email}`);
            user.passwordHash = hashedPassword;
            await user.save();
            console.log(`✅ Password for ${email} reset to: ${newPassword}`);
        } else {
            console.log(`❌ User ${email} not found! Creating new one...`);
            await User.create({
                email,
                phone: '+8801700000000',
                passwordHash: hashedPassword,
                role: 'super_admin',
                profile: { name: 'Super Admin Debug' },
                isActive: true,
                isVerified: true
            });
            console.log(`✅ Created ${email} with password: ${newPassword}`);
        }
    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        process.exit(0);
    }
}

resetAdmin();
