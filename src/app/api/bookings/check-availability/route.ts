import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { roomId, checkIn, checkOut } = await req.json();

        if (!roomId || !checkIn || !checkOut) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validate dates
        if (checkInDate >= checkOutDate) {
            return NextResponse.json({
                available: false,
                error: 'Check-out date must be after check-in date'
            }, { status: 400 });
        }

        if (checkInDate < new Date()) {
            return NextResponse.json({
                available: false,
                error: 'Check-in date cannot be in the past'
            }, { status: 400 });
        }

        // Check for conflicting bookings
        const conflictingBookings = await Booking.find({
            roomId,
            status: { $in: ['confirmed', 'checked_in'] },
            $or: [
                // New booking starts during existing booking
                {
                    checkInDate: { $lte: checkInDate },
                    checkOutDate: { $gt: checkInDate }
                },
                // New booking ends during existing booking
                {
                    checkInDate: { $lt: checkOutDate },
                    checkOutDate: { $gte: checkOutDate }
                },
                // New booking completely overlaps existing booking
                {
                    checkInDate: { $gte: checkInDate },
                    checkOutDate: { $lte: checkOutDate }
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return NextResponse.json({
                available: false,
                conflictingBookings: conflictingBookings.map(b => ({
                    checkIn: b.checkInDate,
                    checkOut: b.checkOutDate
                })),
                message: 'Room is not available for selected dates'
            });
        }

        // Calculate nights and pricing
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        return NextResponse.json({
            available: true,
            nights,
            message: 'Room is available for booking'
        });

    } catch (error) {
        console.error('Availability Check Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
