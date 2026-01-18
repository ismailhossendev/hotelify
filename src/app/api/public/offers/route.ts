import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Offer } from '@/lib/db/models/Offer';

export const dynamic = 'force-dynamic';

// GET - Get public/featured offers for display
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get('hotelId');
        const limit = parseInt(searchParams.get('limit') || '10');
        const featured = searchParams.get('featured') === 'true';

        const now = new Date();

        // Build query for active, public offers
        const query: any = {
            isActive: true,
            isPublic: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { usageLimit: 0 },
                { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
            ]
        };

        if (featured) {
            query.showOnHome = true;
        }

        // If hotelId provided, filter applicable offers
        if (hotelId) {
            query.$or = [
                { scope: 'hotel', hotelId: hotelId },
                { scope: 'platform', applicableHotels: { $size: 0 } }, // All hotels
                { scope: 'platform', applicableHotels: hotelId }
            ];
        }

        const offers = await Offer.find(query)
            .populate('hotelId', 'name slug coverImage')
            .populate('applicableHotels', 'name slug')
            .select('-redemptions')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit);

        return NextResponse.json({ success: true, offers });
    } catch (error) {
        console.error('Get public offers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
