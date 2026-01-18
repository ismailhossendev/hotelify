import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { WithdrawalRequest } from '@/lib/db/models/WithdrawalRequest';
import { Transaction } from '@/lib/db/models/Transaction';
import { getCurrentUser } from '@/lib/auth/token';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { status } = await req.json(); // 'approved' | 'rejected'

        const request = await WithdrawalRequest.findById(params.id);
        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        request.status = status;
        request.processedAt = new Date();
        await request.save();

        if (status === 'approved') {
            // Log transaction
            await Transaction.create({
                hotelId: request.hotelId,
                amount: request.amount,
                type: 'debit',
                purpose: 'withdrawal_payout',
                status: 'completed',
                trxId: `PAY-${Date.now()}`
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
