import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Ticket } from '@/lib/db/models/Ticket';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let query = {};
        if (user.role === 'super_admin' || user.role === 'support_staff') {
            // Admin sees all tickets
            query = {};
        } else if (user.hotelId) {
            // Vendor sees own tickets
            query = { hotelId: user.hotelId };
        } else {
            return NextResponse.json({ success: true, tickets: [] });
        }

        const tickets = await Ticket.find(query)
            .sort({ updatedAt: -1 })
            .populate('hotelId', 'name slug')
            .populate('userId', 'email profile.name')
            .populate('assignedTo', 'profile.name email')
            .lean();

        return NextResponse.json({ success: true, tickets });

    } catch (error) {
        console.error('Tickets fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.hotelId && user.role !== 'super_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { subject, category, priority, message } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        await dbConnect();

        const newTicket = await Ticket.create({
            hotelId: user.hotelId, // Should rely on token
            userId: user.userId,
            subject,
            category: category || 'other',
            priority: priority || 'medium',
            status: 'open',
            messages: [{
                senderId: user.userId,
                senderName: user.name || 'User',
                message,
                sentAt: new Date()
            }],
            lastReplyAt: new Date()
        });

        return NextResponse.json({ success: true, ticket: newTicket });

    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
