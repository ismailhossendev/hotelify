
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { Room } from '@/lib/db/models/Room';
import { addDays, eachDayOfInterval, format, startOfDay } from 'date-fns';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { hotelId, roomId, checkIn, checkOut } = body;

        // Validation
        if (!hotelId || !roomId || !checkIn || !checkOut) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const start = startOfDay(new Date(checkIn));
        const end = startOfDay(new Date(checkOut));

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return NextResponse.json({ success: false, error: 'Invalid date range' }, { status: 400 });
        }

        // Fetch Room Details
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }

        // Generate array of dates (excluding checkout day)
        const dates = eachDayOfInterval({ start, end: addDays(end, -1) });

        let isAvailable = true;
        let totalPrice = 0;
        let breakdown: any[] = [];
        let unavailableDate = null;

        // Check availability for EACH date
        // Optimization: In production, do this with a single aggregation query
        for (const date of dates) {

            // 1. Calculate Price for this date
            // Note: We need to instantiate a model instance to access the method if using plain query result
            // Since we used findById, 'room' is a Mongoose document with methods
            const nightPrice = room.getPriceForDate(date);
            totalPrice += nightPrice;
            breakdown.push({ date: format(date, 'yyyy-MM-dd'), price: nightPrice });

            // 2. Check Availability
            // Count confirmed/pending bookings that include this specific night
            // Logic: A booking overlaps a night if checkIn <= date AND checkOut > date
            const activeBookingsCount = await Booking.countDocuments({
                hotelId,
                roomId,
                status: { $in: ['pending', 'confirmed', 'checked_in'] },
                checkIn: { $lte: date },
                checkOut: { $gt: date }
            });

            if (activeBookingsCount >= room.totalRooms) {
                isAvailable = false;
                unavailableDate = format(date, 'yyyy-MM-dd');
                break; // Stop checking if one date is unavailable
            }
        }

        return NextResponse.json({
            success: true,
            available: isAvailable,
            totalPrice: isAvailable ? totalPrice : 0,
            breakdown: isAvailable ? breakdown : [],
            unavailableDate
        });

    } catch (error) {
        console.error('Availability Check Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
