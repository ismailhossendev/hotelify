import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { WithdrawalRequest } from '@/lib/db/models/WithdrawalRequest';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const requests = await WithdrawalRequest.find({})
            .populate('hotelId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
