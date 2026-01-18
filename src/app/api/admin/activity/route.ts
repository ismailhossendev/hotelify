import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { AuditLog } from '@/lib/db/models/AuditLog';
import { getCurrentUser } from '@/lib/auth/token';
import { User } from '@/lib/db/models/User'; // Ensure User model is registered

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch 20 recent logs
        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'email profile.name role')
            .populate('hotelId', 'name slug');

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('Fetch activities error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
