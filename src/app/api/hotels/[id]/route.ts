import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const hotel = await Hotel.findById(params.id).populate('planId');
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, hotel });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const hotel = await Hotel.findById(params.id);
        if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });

        // Access Check (Super Admin or Owner)
        if (user.role !== 'super_admin' && hotel.ownerId.toString() !== user.userId && user.hotelId !== params.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();

        // Allowed fields to update
        const { name, description, contact, policies, amenities, images, coverImage } = body;

        // Update fields if provided
        if (name) hotel.name = name;
        if (description) hotel.description = description;
        if (contact) {
            // Safe deep merge for contact
            const currentContact = hotel.contact ? hotel.contact.toObject() : {};

            hotel.contact = {
                ...currentContact,
                ...contact, // Overwrites top-level fields (email, phone, etc.)

                // Deep merge address if provided in update
                address: contact.address ? {
                    ...(currentContact.address || {}),
                    ...contact.address
                } : currentContact.address,

                // Preserve coordinates from currentContact if not in update (handled by first spread)
                // Explicitly valid: if contact.coordinates is provided, it overwrites. 
                // If not, currentContact.coordinates remains.
            };
        }
        if (policies) {
            hotel.policies = { ...hotel.policies, ...policies };
        }
        if (amenities) hotel.amenities = amenities;
        if (images) hotel.images = images;
        if (coverImage) hotel.coverImage = coverImage;

        await hotel.save();

        // Audit
        await AuditLog.create({
            hotelId: hotel._id,
            userId: user.userId,
            action: 'settings_change',
            entityType: 'Hotel',
            entityId: hotel._id,
            description: `Hotel settings updated`
        });

        return NextResponse.json({ success: true, hotel });

    } catch (error) {
        console.error('Update hotel error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
