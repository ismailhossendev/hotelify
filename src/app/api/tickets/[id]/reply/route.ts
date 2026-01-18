import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Ticket } from '@/lib/db/models/Ticket';
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { message, status } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        await dbConnect();

        const ticket = await Ticket.findById(params.id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Access control
        const isAdmin = user.role === 'super_admin' || user.role === 'support_staff';
        const isOwner = ticket.userId.toString() === user.userId || ticket.hotelId.toString() === user.hotelId;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update logic
        const updateData: any = {
            $push: {
                messages: {
                    senderId: user.userId,
                    senderName: user.name || (isAdmin ? 'Support Agent' : 'User'),
                    message,
                    sentAt: new Date()
                }
            },
            $set: {
                lastReplyAt: new Date()
            }
        };

        // If provided a status update (usually by admin), use it. Or auto-update.
        if (status) {
            updateData.$set.status = status;
        } else {
            // Auto-status
            if (isAdmin) {
                updateData.$set.status = 'in_progress';
                if (!ticket.assignedTo) {
                    updateData.$set.assignedTo = user.userId;
                }
            } else {
                // If user replies, re-open if it was closed or pending
                if (ticket.status === 'resolved' || ticket.status === 'closed') {
                    updateData.$set.status = 'open';
                }
            }
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        )
            .populate('hotelId', 'name')
            .populate('userId', 'email profile.name')
            .populate('assignedTo', 'profile.name');

        return NextResponse.json({ success: true, ticket: updatedTicket });

    } catch (error) {
        console.error('Ticket reply error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
