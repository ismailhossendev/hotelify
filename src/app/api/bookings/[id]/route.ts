import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { User } from '@/lib/db/models/User'; // Ensure loaded
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        // Force model registration
        const _u = User;

        const booking = await Booking.findById(params.id)
            .populate('roomId', 'name roomType basePrice')
            .populate('guestId', 'profile')
            .populate('createdBy', 'profile.name');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Access check
        const isOwner = booking.hotelId.toString() === user.hotelId;
        const isGuest = booking.guestId?.toString() === user.userId;

        if (user.role !== 'super_admin' && !isOwner && !isGuest) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ success: true, booking });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const body = await req.json();
        const { action, guestDetails, documents } = body;
        // action: 'check_in', 'check_out', 'approve', 'cancel'

        const booking = await Booking.findById(params.id);
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // Access check
        if (user.role !== 'super_admin' && booking.hotelId.toString() !== user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        let updateData: any = {};
        let auditAction = 'update';
        let auditDesc = 'Booking updated';

        if (action === 'check_in') {
            updateData.status = 'checked_in';
            updateData.checkedInAt = new Date();

            // Merge guest details if provided
            if (guestDetails) {
                updateData.guestDetails = { ...booking.guestDetails, ...guestDetails };
                if (documents) {
                    updateData['guestDetails.documents'] = documents; // or handle manually
                }
            }
            auditAction = 'check_in';
            auditDesc = `Checked in guest ${booking.guestDetails?.name}`;
        } else if (action === 'check_out') {
            updateData.status = 'checked_out';
            updateData.checkedOutAt = new Date();
            // Maybe calculate final bill?
            auditAction = 'check_out';
            auditDesc = `Checked out guest ${booking.guestDetails?.name}`;
        } else if (action === 'cancel') {
            updateData.status = 'cancelled';
            updateData.cancelledAt = new Date();
            auditAction = 'cancel';
            auditDesc = `Cancelled booking ${booking.bookingNumber}`;
        } else if (guestDetails || body.additionalGuests || body.specialRequests || body.status || body.paymentStatus || body.pricing) {
            // Updated Generic Editing Logic
            if (guestDetails) {
                updateData.guestDetails = { ...booking.guestDetails, ...guestDetails };
                // Ensure documents array is preserved or updated correctly
                if (guestDetails.documents) {
                    updateData['guestDetails.documents'] = guestDetails.documents;
                }
            }
            if (body.additionalGuests) updateData.additionalGuests = body.additionalGuests;
            if (body.specialRequests) updateData.specialRequests = body.specialRequests;

            if (body.status) updateData.status = body.status;
            if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;

            // Pricing Logic
            if (body.pricing) {
                if (body.pricing.discount !== undefined) updateData['pricing.discount'] = body.pricing.discount;
                if (body.pricing.totalAmount !== undefined) updateData['pricing.totalAmount'] = body.pricing.totalAmount;
            }
        }

        if (body.roomUnitId) {
            // Basic conflict check (should be more robust)
            const conflicting = await Booking.findOne({
                _id: { $ne: params.id },
                roomUnitId: body.roomUnitId,
                status: { $in: ['confirmed', 'checked_in'] },
                $or: [
                    { checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn } }
                ]
            });

            if (conflicting) {
                return NextResponse.json({ error: 'Room Unit is already occupied for these dates' }, { status: 409 });
            }
            updateData.roomUnitId = body.roomUnitId;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(params.id, updateData, { new: true });

        await AuditLog.create({
            hotelId: booking.hotelId,
            userId: user.userId,
            action: auditAction,
            entityType: 'Booking',
            entityId: booking._id,
            description: auditDesc
        });

        return NextResponse.json({ success: true, booking: updatedBooking });

    } catch (error) {
        console.error('Update booking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
