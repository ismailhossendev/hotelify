import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { role, isActive } = await req.json();
        const user = await User.findById(params.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent self-deactivation/demotion if desired, currently allowing for flexibility
        // but typically a super admin shouldn't be able to deactivate themselves easily via this UI
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        // Audit Log
        await AuditLog.create({
            hotelId: currentUser.hotelId, // Should be null for super_admin
            userId: currentUser.userId,
            action: 'update_user',
            description: `Updated user ${user.email} - Role: ${user.role}, Active: ${user.isActive}`,
            ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
