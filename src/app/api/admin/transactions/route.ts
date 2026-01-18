import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Transaction } from '@/lib/db/models/Transaction';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Ensure Transaction model is registered
        // If Model not found error: import { Transaction } from '@/lib/db/models/Transaction';

        const transactions = await Transaction.find({})
            .populate('hotelId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, transactions });

    } catch (error) {
        console.error('Admin transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
