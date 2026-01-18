import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';

// POST: Admin updates domain verification status
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { verified, ssl } = body;

        await dbConnect();

        const updateData: any = {};
        if (verified !== undefined) updateData['domain.customDomainVerified'] = verified;
        if (ssl !== undefined) updateData['domain.sslEnabled'] = ssl;

        const hotel = await Hotel.findByIdAndUpdate(
            params.id,
            { $set: updateData },
            { new: true }
        ).select('domain name');

        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, hotel });
    } catch (error) {
        console.error('Admin domain update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
