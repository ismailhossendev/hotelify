import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const payload = await getCurrentUser();

        if (!payload) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(payload.userId)
            .select('-passwordHash -twoFactorSecret')
            .populate('hotelId', 'name slug domain logo');

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Me endpoint error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
