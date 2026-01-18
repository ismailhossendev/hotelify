import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Room } from '@/lib/db/models/Room';
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.hotelId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        // List dirty or all rooms for housekeeping view
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const query: any = { hotelId: user.hotelId };
        if (status) query.housekeepingStatus = status;

        const rooms = await Room.find(query)
            .select('name roomType housekeepingStatus lastCleanedAt lastCleanedBy')
            .sort({ housekeepingStatus: 1 }); // dirty first usually

        return NextResponse.json({ success: true, rooms });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.hotelId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await req.json();
        const { roomId, status } = body;

        if (!roomId || !status) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        const room = await Room.findOne({ _id: roomId, hotelId: user.hotelId });
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

        room.housekeepingStatus = status;
        if (status === 'clean') {
            room.lastCleanedAt = new Date();
            room.lastCleanedBy = user.userId;
        }

        await room.save();

        // Audit? Maybe too verbose for housekeeping, but good for tracking staff performance

        return NextResponse.json({ success: true, room });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
