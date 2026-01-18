import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { Transaction } from '@/lib/db/models/Transaction'; // Verify this exists
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { amount, type, purpose } = await req.json(); // type: 'credit' | 'debit'

        // Log Transaction
        await Transaction.create({
            hotelId: params.id,
            amount: amount,
            type: type,
            purpose: purpose || 'manual_adjustment',
            status: 'completed',
            trxId: `MNL-${Date.now()}`
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Wallet top-up error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
