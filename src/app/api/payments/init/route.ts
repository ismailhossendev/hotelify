import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Transaction } from '@/lib/db/models/Transaction';
import { Booking } from '@/lib/db/models/Booking';
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Payment initiation usually requires auth
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await req.json();
        const { bookingId, amount, method, gateway } = body; // gateway = 'bkash' | 'nagad'

        // 1. Verify Booking
        const booking = await Booking.findById(bookingId);
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // 2. Placeholder for Gateway Integration
        // In real world, we would call bKash/Nagad init API here.
        // For now, we simulate a successful initiation or direct mock payment.

        const transactionId = `${gateway?.toUpperCase()}-${Date.now()}`;

        // 3. Create Transaction Record (Pending)
        const transaction = await Transaction.create({
            hotelId: booking.hotelId,
            userId: user.userId,
            type: 'booking_payment',
            amount,
            relatedId: booking._id,
            relatedType: 'Booking',
            paymentMethod: method || gateway,
            paymentGateway: {
                provider: gateway,
                transactionId: transactionId,
                status: 'pending' // pending until callback
            },
            status: 'pending'
        });

        // Return payment URL or details
        return NextResponse.json({
            success: true,
            data: {
                paymentUrl: `https://mock-gateway.com/pay/${transactionId}`, // Mock URL
                transactionId,
                message: 'Payment initiated. Please complete on gateway.'
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
