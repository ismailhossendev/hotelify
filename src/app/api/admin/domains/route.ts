import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DomainRequest } from '@/lib/db/models/DomainRequest';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const requests = await DomainRequest.find({})
            .populate('hotelId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
