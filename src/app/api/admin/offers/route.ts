import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Offer } from '@/lib/db/models/Offer';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

// GET - List all platform offers (admin only)
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const scope = searchParams.get('scope') || 'all';
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build query
        const query: any = {};
        if (scope !== 'all') {
            query.scope = scope;
        }
        if (status === 'active') {
            query.isActive = true;
            query.validUntil = { $gte: new Date() };
        } else if (status === 'expired') {
            query.validUntil = { $lt: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const total = await Offer.countDocuments(query);
        const offers = await Offer.find(query)
            .populate('hotelId', 'name slug')
            .populate('applicableHotels', 'name slug')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            offers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get offers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new platform offer
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Validate required fields
        if (!body.code || !body.title || !body.discountValue || !body.validUntil) {
            return NextResponse.json({
                error: 'Missing required fields: code, title, discountValue, validUntil'
            }, { status: 400 });
        }

        // Check if code already exists
        const existingOffer = await Offer.findOne({
            code: body.code.toUpperCase(),
            scope: 'platform'
        });
        if (existingOffer) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        // Create offer
        const offer = await Offer.create({
            ...body,
            code: body.code.toUpperCase(),
            scope: 'platform',
            createdBy: user.userId
        });

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Create offer error:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}
