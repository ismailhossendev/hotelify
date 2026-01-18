import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { AuditLog } from '@/lib/db/models/AuditLog';
import { User } from '@/lib/db/models/User'; // Ensure population
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const logs = await AuditLog.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'email profile.name')
            .lean();

        return NextResponse.json({ success: true, logs });

    } catch (error) {
        console.error('Audit logs fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
