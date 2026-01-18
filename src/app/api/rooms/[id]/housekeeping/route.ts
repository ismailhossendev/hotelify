import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Room } from '@/lib/db/models/Room';
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { status } = await req.json();

        if (!['clean', 'dirty', 'maintenance'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const room = await Room.findById(params.id);
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

        // Access Check
        if (room.hotelId.toString() !== user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        room.housekeepingStatus = status;
        await room.save();

        // Audit
        await AuditLog.create({
            hotelId: user.hotelId,
            userId: user.userId,
            action: 'update',
            entityType: 'Room',
            entityId: room._id,
            description: `Room ${room.name} marked as ${status}`
        });

        return NextResponse.json({ success: true, room });

    } catch (error) {
        console.error('Housekeeping update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
