import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Room } from '@/lib/db/models/Room';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;

        // Fetch all rooms for this hotel
        const rooms = await Room.find({ hotelId: id })
            .select('name type basePrice capacity amenities gallery description bedType roomSize isActive')
            .sort({ basePrice: 1 }); // Sort by price: low to high

        // Group rooms by type for better organization
        const roomsByType: Record<string, any[]> = {};
        rooms.forEach(room => {
            const type = room.type || 'standard';
            if (!roomsByType[type]) {
                roomsByType[type] = [];
            }
            roomsByType[type].push(room.toObject());
        });

        return NextResponse.json({
            success: true,
            rooms: rooms.map(r => r.toObject()),
            roomsByType
        });

    } catch (error) {
        console.error('Rooms Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
