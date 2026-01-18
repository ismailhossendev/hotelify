import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Auth check
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const type = searchParams.get('type'); // 'all' or 'online'
        const hotelId = searchParams.get('hotelId');
        const date = searchParams.get('date'); // Check-in date
        const status = searchParams.get('status');

        let query: any = {};

        // Filter by Type
        if (type === 'online') {
            query.bookingType = 'online';
        }

        // Filter by Hotel
        if (hotelId && hotelId !== 'all') {
            query.hotelId = hotelId;
        }

        // Filter by Status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by Date (Check-in)
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query.checkIn = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Search (Booking ID, Name, Phone, NID)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { bookingNumber: searchRegex },
                { 'guestDetails.name': searchRegex },
                { 'guestDetails.phone': searchRegex },
                { 'guestDetails.nid': searchRegex },
                { 'guestDetails.email': searchRegex }
            ];

            // Try to match ObjectId if search is valid Hex
            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                query.$or.push({ _id: search });
            }
        }

        // Execute Query
        const bookings = await Booking.find(query)
            .populate('hotelId', 'name')
            .populate('roomId', 'name')
            .sort({ createdAt: -1 }) // Newest first
            .limit(100); // Pagination recommended for future

        return NextResponse.json({ success: true, bookings });

    } catch (error) {
        console.error('Admin Bookings API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
