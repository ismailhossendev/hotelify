
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { User } from '@/lib/db/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { hotelId, roomId, checkIn, checkOut, quantity, guest, paymentMethod, totalAmount } = body;

        // 1. Basic Validation
        if (!hotelId || !roomId || !checkIn || !checkOut || !guest?.name || !guest?.phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Find or Create Guest User
        let userId = null;
        const existingUser = await User.findOne({
            $or: [{ email: guest.email }, { phone: guest.phone }]
        });

        if (existingUser) {
            userId = existingUser._id;
        } else {
            const newUser = await User.create({
                name: guest.name,
                email: guest.email || `guest-${Date.now()}@hotelify.local`,
                phone: guest.phone,
                role: ['user'],
                password: `guest${Date.now()}`
            });
            userId = newUser._id;
        }

        // 3. Create Booking Record with Correct Schema
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

        const bookingNumber = `BK-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 99)}`;

        const newBooking = await mongoose.models.Booking.create({
            hotelId,
            roomId,
            guestId: userId,

            bookingNumber, // e.g. BK-12345678
            bookingType: 'online',

            guestDetails: {
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                nationality: 'Bangladeshi'
            },

            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,

            guests: {
                adults: body.guests || 2,
                children: 0
            },

            pricing: {
                subtotal: totalAmount,
                totalAmount: totalAmount,
                // Simplification: assuming flat rate for now in Public API MVP
                roomCharges: [{ date: checkInDate, price: totalAmount }]
            },

            grandTotal: totalAmount,
            amountPaid: 0,
            amountDue: totalAmount,

            paymentStatus: 'pending',

            // Online bookings usually need confirmation
            status: 'pending',
            requiresApproval: true,
            approvalStatus: 'pending',

            internalNotes: `Booked via Public Website. Payment Method: ${paymentMethod}`
        });

        return NextResponse.json({ success: true, bookingId: newBooking._id, bookingNumber });

    } catch (error: any) {
        console.error('Booking Error:', error);
        return NextResponse.json({ error: error.message || 'Booking failed' }, { status: 500 });
    }
}
