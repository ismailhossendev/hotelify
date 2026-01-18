import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Offer } from '@/lib/db/models/Offer';
import { getCurrentUser } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

// GET - Get single offer
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const offer = await Offer.findById(params.id)
            .populate('hotelId', 'name slug')
            .populate('applicableHotels', 'name slug')
            .populate('createdBy', 'name email');

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, offer });
    } catch (error) {
        console.error('Get offer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update offer
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // If updating code, check for duplicates
        if (body.code) {
            const existingOffer = await Offer.findOne({
                code: body.code.toUpperCase(),
                scope: 'platform',
                _id: { $ne: params.id }
            });
            if (existingOffer) {
                return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
            }
            body.code = body.code.toUpperCase();
        }

        const offer = await Offer.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        ).populate('hotelId', 'name slug')
            .populate('applicableHotels', 'name slug');

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Update offer error:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }
}

// DELETE - Delete offer
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const offer = await Offer.findByIdAndDelete(params.id);

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        console.error('Delete offer error:', error);
        return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
    }
}
