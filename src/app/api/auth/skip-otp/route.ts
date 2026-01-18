import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { SystemConfig } from '@/lib/db/models/SystemConfig';
import { signToken, setAuthCookie } from '@/lib/auth/token';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check Config
        const configDoc = await SystemConfig.findOne({ key: 'platform_config' });
        const config = configDoc ? configDoc.value : {};

        const isVendor = user.role === 'vendor_admin';
        const customerOtpMandatory = config.customerOtpMandatory !== false;

        // Validation: Can this user skip?
        if (isVendor) {
            return NextResponse.json({ error: 'Vendors cannot skip verification' }, { status: 403 });
        }

        if (customerOtpMandatory) {
            return NextResponse.json({ error: 'OTP verification is mandatory' }, { status: 403 });
        }

        // Allow Skip
        // We do NOT mark them as verified, just log them in.
        // Or should we? If it's optional, maybe being unverified is fine.

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
            },
            message: 'Verification skipped'
        });

    } catch (error) {
        console.error('Skip OTP Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
