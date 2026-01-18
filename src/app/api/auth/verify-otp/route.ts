import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { signToken, setAuthCookie } from '@/lib/auth/token';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { userId, code } = await req.json();

        if (!userId || !code) {
            return NextResponse.json({ error: 'Missing userId or code' }, { status: 400 });
        }

        // Find user with matching ID and OTP, and check expiry
        // Note: OTP is selected false by default, so we must explicitly select it
        const user = await User.findById(userId).select('+otp +otpExpires');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 200 });
        }

        if (user.otp !== code) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
        }

        // Verify Success
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate Token & Login
        const token = signToken({
            userId: user._id.toString(),
            role: user.role,
            hotelId: user.hotelId?.toString()
        });

        setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.profile.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
