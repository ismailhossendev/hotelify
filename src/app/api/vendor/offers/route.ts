import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Offer } from '@/lib/db/models/Offer';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

// GET - List vendor's hotel offers
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['vendor_admin', 'vendor_staff', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get vendor's hotels - check hotelId first, then ownerId
        let hotelIds: any[] = [];

        if (user.hotelId) {
            hotelIds = [user.hotelId];
        } else {
            const hotels = await Hotel.find({ ownerId: user.userId }).select('_id');
            hotelIds = hotels.map(h => h._id);
        }

        if (hotelIds.length === 0) {
            return NextResponse.json({ success: true, offers: [] });
        }

        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get('hotelId');
        const status = searchParams.get('status');

        // Build query
        const query: any = {
            scope: 'hotel',
            hotelId: hotelId ? hotelId : { $in: hotelIds }
        };

        if (status === 'active') {
            query.isActive = true;
            query.validUntil = { $gte: new Date() };
        } else if (status === 'expired') {
            query.validUntil = { $lt: new Date() };
        }

        const offers = await Offer.find(query)
            .populate('hotelId', 'name slug')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, offers });
    } catch (error) {
        console.error('Get vendor offers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create offer for vendor's hotel
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['vendor_admin', 'vendor_staff', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Validate required fields
        if (!body.code || !body.title || !body.discountValue || !body.validUntil || !body.hotelId) {
            return NextResponse.json({
                error: 'Missing required fields: code, title, discountValue, validUntil, hotelId'
            }, { status: 400 });
        }

        // Verify hotel ownership - check if hotel is assigned to vendor or owned by them
        const hotel = await Hotel.findOne({
            _id: body.hotelId,
            $or: [
                { _id: user.hotelId },
                { ownerId: user.userId }
            ]
        });
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found or not authorized' }, { status: 403 });
        }

        // Check if code already exists for this hotel
        const existingOffer = await Offer.findOne({
            code: body.code.toUpperCase(),
            hotelId: body.hotelId
        });
        if (existingOffer) {
            return NextResponse.json({ error: 'Coupon code already exists for this hotel' }, { status: 400 });
        }

        // Create offer
        const offer = await Offer.create({
            ...body,
            code: body.code.toUpperCase(),
            scope: 'hotel',
            createdBy: user.userId
        });

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Create vendor offer error:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}
