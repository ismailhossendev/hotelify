import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser, signToken, setAuthCookie } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        const admin = await getCurrentUser();
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized - Super Admin only' }, { status: 401 });
        }

        await dbConnect();

        const { userId, hotelId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Find the target user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate a new token as the target user
        // IMPORTANT: Mark this as an impersonation session
        const token = signToken({
            userId: targetUser._id.toString(),
            role: targetUser.role,
            hotelId: hotelId || targetUser.hotelId?.toString(),
            impersonatedBy: admin.userId // Track who is impersonating
        });

        setAuthCookie(token);

        // Audit Log - Critical security action
        await AuditLog.create({
            hotelId: hotelId || targetUser.hotelId,
            userId: admin.userId,
            action: 'settings_change',
            entityType: 'User',
            entityId: targetUser._id,
            description: `Super Admin ${admin.userId} impersonated user ${targetUser.email}`,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({
            success: true,
            message: `Now logged in as ${targetUser.email}`,
            user: {
                id: targetUser._id,
                email: targetUser.email,
                role: targetUser.role
            }
        });

    } catch (error) {
        console.error('Impersonate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
