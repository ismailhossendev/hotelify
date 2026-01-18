
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { Room } from '@/lib/db/models/Room';
import { Hotel } from '@/lib/db/models/Hotel';
import { differenceInCalendarDays } from 'date-fns';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { hotelId, roomId, guestDetails, dates } = body;

        // Validation
        if (!hotelId || !roomId || !guestDetails || !dates) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const checkIn = new Date(dates.checkIn);
        const checkOut = new Date(dates.checkOut);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return NextResponse.json({ success: false, error: 'Invalid dates' }, { status: 400 });
        }

        if (checkIn >= checkOut) {
            return NextResponse.json({ success: false, error: 'Check-out must be after check-in' }, { status: 400 });
        }

        const nights = differenceInCalendarDays(checkOut, checkIn);
        if (nights < 1) {
            return NextResponse.json({ success: false, error: 'Minimum 1 night stay' }, { status: 400 });
        }

        // Verify Hotel & Room
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }

        // Calculate Price (Simplified: Base Price * Nights)
        // Future: Fetch seasonal pricing from room charges logic
        const totalPrice = room.basePrice * nights;

        // Generate Booking Number (e.g., BK-TIMESTAMP-RANDOM)
        const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // Create Booking
        const booking = await Booking.create({
            hotelId,
            roomId,
            bookingNumber,
            bookingType: 'online',
            guestDetails: {
                name: guestDetails.name,
                email: guestDetails.email,
                phone: guestDetails.phone,
                nid: guestDetails.nid,
                address: guestDetails.address,
                documents: guestDetails.documents || [] // [{ type: 'nid', url: 'base64...' }]
            },
            additionalGuests: body.additionalGuests || [],
            specialRequests: body.specialRequests,
            checkIn,
            checkOut,
            nights,
            guests: {
                adults: guestDetails.adults || 1,
                children: guestDetails.children || 0
            },
            pricing: {
                subtotal: totalPrice,
                totalAmount: totalPrice
            },
            status: 'pending',
            paymentStatus: 'pending'
        });

        return NextResponse.json({
            success: true,
            bookingNumber: booking.bookingNumber,
            message: 'Booking request received successfully'
        });

    } catch (error) {
        console.error('Booking API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
