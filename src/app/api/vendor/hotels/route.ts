import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

// GET - List vendor's own hotels only
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow vendors and super_admin
        if (!['vendor_admin', 'vendor_staff', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let hotels;

        if (user.role === 'super_admin') {
            // Super admin can see all hotels
            hotels = await Hotel.find({})
                .select('_id name slug isActive')
                .sort({ name: 1 });
        } else if (user.hotelId) {
            // Vendor has a specific hotel assigned via hotelId
            hotels = await Hotel.find({ _id: user.hotelId })
                .select('_id name slug isActive');
        } else {
            // Fallback: check by ownerId
            hotels = await Hotel.find({ ownerId: user.userId })
                .select('_id name slug isActive')
                .sort({ name: 1 });
        }

        return NextResponse.json({ success: true, hotels });
    } catch (error) {
        console.error('Get vendor hotels error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
