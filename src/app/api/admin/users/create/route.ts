import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/token';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, role } = body;

        // Validation
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check availability
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            passwordHash: hashedPassword,
            role,
            profile: { name },
            isActive: true,
            isVerified: true
        });

        return NextResponse.json({ success: true, user: newUser });

    } catch (error) {
        console.error('Create staff error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
