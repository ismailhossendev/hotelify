import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { getCurrentUser } from '@/lib/auth/token';

// GET: Fetch Single Booking Details
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const booking = await Booking.findById(params.id)
            .populate('hotelId', 'name contact')
            .populate('roomId', 'name')
            .populate('guestId', 'name email phone');

        if (!booking) {
            return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch booking' }, { status: 500 });
    }
}

// PATCH: Update Booking (Status, Payment, etc.)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const updateData: any = {};

        // Allow updating specific fields
        if (body.status) updateData.status = body.status;
        if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
        if (body.amountPaid !== undefined) updateData.amountPaid = body.amountPaid;

        // Guest Details
        if (body.guestDetails) {
            // We use dot notation for nested fields to avoid overwriting the entire object if not intended,
            // but here we are likely sending the whole object back from the UI form.
            // Using generic $set with flattened keys is safer for partial updates, 
            // but if the UI sends the whole structure, we can just set it.
            // Let's use a merge strategy if possible, or just set the whole sub-document if the UI is authoritative.
            // Given the UI sends the complete 'guestDetails' object:
            updateData.guestDetails = body.guestDetails;
        }

        // Additional Guests
        if (body.additionalGuests) {
            updateData.additionalGuests = body.additionalGuests;
        }

        // Pricing (Discount & Total)
        if (body.pricing) {
            // We need to be careful not to wipe out subtotal/taxes if they aren't sent
            // The UI sends 'pricing' with discount and totalAmount.
            if (body.pricing.discount !== undefined) updateData['pricing.discount'] = body.pricing.discount;
            if (body.pricing.totalAmount !== undefined) updateData['pricing.totalAmount'] = body.pricing.totalAmount;
        }

        // Tracking who modified it
        updateData.lastModifiedBy = user.userId;

        const booking = await Booking.findByIdAndUpdate(
            params.id,
            { $set: updateData },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
    }
}
