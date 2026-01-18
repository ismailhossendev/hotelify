import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Room } from '@/lib/db/models/Room';
import { getCurrentUser } from '@/lib/auth/token';
import { createRoomSchema } from '@/lib/validations/room';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role === 'guest') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.hotelId) {
            return NextResponse.json({ error: 'No hotel assigned' }, { status: 400 });
        }

        await dbConnect();
        const body = await req.json();

        const validation = createRoomSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
        }

        const room = await Room.create({
            ...validation.data,
            hotelId: user.hotelId
        });

        await AuditLog.create({
            hotelId: user.hotelId,
            userId: user.userId,
            action: 'create',
            entityType: 'Room',
            entityId: room._id,
            description: `Room created: ${room.name}`
        });

        return NextResponse.json({ success: true, room }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get('hotelId');

        // Public can list rooms for a hotel if hotelId provided
        // Vendor can list their own rooms

        const user = await getCurrentUser();

        let query: any = { isActive: true };

        // Check access
        if (hotelId) {
            query.hotelId = hotelId;
        } else if (user && user.hotelId) {
            query.hotelId = user.hotelId;
        } else {
            return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
        }

        const rooms = await Room.find(query).sort({ sortOrder: 1 });

        return NextResponse.json({ success: true, rooms });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
