import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/token';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await connectDB();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(currentUser.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.profile?.name || "User",
                email: user.email,
                phone: user.phone,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, address, avatar, currentPassword, newPassword } = body;

        const user = await User.findById(currentUser.userId).select('+passwordHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Password Update Logic
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            user.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        // 2. Profile Updates
        if (name) user.profile.name = name;
        if (address) user.profile.address = address;
        if (avatar !== undefined) user.profile.avatar = avatar; // Allow empty string to remove avatar

        // 3. Contact Updates (Check uniqueness if changed)
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            user.email = email;
        }

        if (phone && phone !== user.phone) {
            const exists = await User.findOne({ phone });
            if (exists) return NextResponse.json({ error: 'Phone already in use' }, { status: 400 });
            user.phone = phone;
        }

        await user.save();

        return NextResponse.json({
            success: true,
            user: {
                name: user.profile.name,
                email: user.email,
                phone: user.phone,
                address: user.profile.address,
                avatar: user.profile.avatar
            }
        });

    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
