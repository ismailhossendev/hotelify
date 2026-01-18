
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Room } from '@/lib/db/models/Room';
import { Hotel } from '@/lib/db/models/Hotel';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { hotelId: string } }) {
    try {
        await dbConnect();

        const hotelId = params.hotelId;

        // First verify hotel exists and is active
        const hotel = await Hotel.findById(hotelId);
        if (!hotel || !hotel.isActive) {
            return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
        }

        // Fetch all active rooms for this hotel
        const rooms = await Room.find({ hotelId: hotelId, isActive: true })
            .select('name roomType basePrice capacity description amenities images')
            .sort({ basePrice: 1 });

        return NextResponse.json({
            success: true,
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                type: room.roomType,
                price: room.basePrice,
                capacity: room.capacity,
                description: room.description,
                amenities: room.amenities,
                image: room.images?.[0]?.url || null
            }))
        });

    } catch (error) {
        console.error('Public Rooms API Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
