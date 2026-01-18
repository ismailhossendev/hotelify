import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { getCurrentUser, signToken, setAuthCookie } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        const currentSession = await getCurrentUser();

        // Security Check: Only allow if this is an impersonated session
        if (!currentSession || !currentSession.impersonatedBy) {
            return NextResponse.json({
                error: 'Not an impersonated session'
            }, { status: 403 });
        }

        await dbConnect();

        // Find the original Super Admin
        console.log('[EndImpersonation] Searching for original admin:', currentSession.impersonatedBy);
        const superAdmin = await User.findById(currentSession.impersonatedBy);

        if (!superAdmin) {
            console.error('[EndImpersonation] Admin not found in DB with ID:', currentSession.impersonatedBy);
        } else if (superAdmin.role !== 'super_admin') {
            console.error('[EndImpersonation] User found but not super_admin. Role:', superAdmin.role);
        }

        if (!superAdmin || superAdmin.role !== 'super_admin') {
            return NextResponse.json({
                error: 'Original admin not found or not authorized'
            }, { status: 403 });
        }

        // Generate a new token as the Super Admin
        const token = signToken({
            userId: superAdmin._id.toString(),
            role: superAdmin.role,
            hotelId: superAdmin.hotelId?.toString()
            // No impersonatedBy - this is the real admin session
        });

        setAuthCookie(token);

        // Audit Log
        await AuditLog.create({
            hotelId: currentSession.hotelId,
            userId: superAdmin._id,
            action: 'settings_change',
            entityType: 'User',
            entityId: superAdmin._id,
            description: `Super Admin ${superAdmin.email} ended impersonation session`,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({
            success: true,
            message: 'Returned to Super Admin session'
        });

    } catch (error) {
        console.error('End impersonation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
