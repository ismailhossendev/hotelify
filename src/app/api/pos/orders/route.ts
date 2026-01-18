import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { POSOrder } from '@/lib/db/models/POSOrder';
import { User } from '@/lib/db/models/User';
import { Booking } from '@/lib/db/models/Booking'; // For room charge
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const body = await req.json();
        const { items, paymentMethod, guestDetails, bookingId, discount, notes } = body;

        // Validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate Totals
        let subtotal = 0;
        const orderItems = items.map((item: any) => {
            const total = item.price * item.qty;
            subtotal += total;
            return {
                itemId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.qty,
                total: total
            };
        });

        // VAT / Tax Logic (Simulated 5% for now)
        const tax = subtotal * 0.05;
        const total = (subtotal + tax) - (discount || 0);

        // Room Charge Validation
        if (paymentMethod === 'room_charge') {
            if (!bookingId) return NextResponse.json({ error: 'Booking ID required for room charge' }, { status: 400 });
            // Verify booking exists and is checked_in
            const booking = await Booking.findById(bookingId);
            if (!booking || booking.status !== 'checked_in') {
                return NextResponse.json({ error: 'Invalid booking for room charge' }, { status: 400 });
            }
        }

        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const count = await POSOrder.countDocuments({ hotelId: user.hotelId });
        const orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        const order = await POSOrder.create({
            hotelId: user.hotelId,
            orderNumber,
            items: orderItems,
            subtotal,
            tax,
            discount: discount || 0,
            total,
            paymentMethod,
            status: paymentMethod === 'room_charge' ? 'delivered' : 'pending', // Auto deliver if room charge? maybe not.
            paymentStatus: paymentMethod === 'room_charge' ? 'room_charged' : 'pending',
            bookingId: bookingId || undefined,
            guestName: guestDetails?.name,
            guestPhone: guestDetails?.phone,
            notes,
            createdBy: user.userId
        });

        // If Room Charge, update Booking
        if (paymentMethod === 'room_charge' && bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                $push: {
                    posCharges: {
                        orderId: order._id,
                        amount: total,
                        description: `POS Order ${orderNumber}`
                    }
                },
                $inc: { 'pricing.totalAmount': total } // Update main total
            });
        }

        // Audit
        await AuditLog.create({
            hotelId: user.hotelId,
            userId: user.userId,
            action: 'create',
            entityType: 'POSOrder',
            entityId: order._id,
            description: `Created POS Order ${orderNumber} - ${total}`
        });

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error('Create POS Order error:', error);
        return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
    }
}
