import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { Room } from '@/lib/db/models/Room';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        // Vendor Dashboard Stats
        if (user.role.includes('vendor')) {
            if (!user.hotelId) return NextResponse.json({ stats: {} });

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stats = await Promise.all([
                // 1. Total Bookings
                Booking.countDocuments({ hotelId: user.hotelId }),

                // 2. Today's Check-ins
                Booking.countDocuments({
                    hotelId: user.hotelId,
                    checkIn: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
                    status: 'confirmed'
                }),

                // 3. Pending Approvals
                Booking.countDocuments({ hotelId: user.hotelId, status: 'pending' }),

                // 4. Room Status
                Room.aggregate([
                    { $match: { hotelId: new mongoose.Types.ObjectId(user.hotelId) } },
                    { $group: { _id: '$housekeepingStatus', count: { $sum: 1 } } }
                ])
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    totalBookings: stats[0],
                    todayCheckIns: stats[1],
                    pendingRequests: stats[2],
                    roomStatus: stats[3]
                }
            });
        }

        // Super Admin Stats
        if (user.role === 'super_admin') {
            // Global stats logic
            return NextResponse.json({ message: 'Global stats not implemented yet' });
        }

        return NextResponse.json({ stats: {} });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import mongoose from 'mongoose';
