import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

// GET: Fetch current domain settings
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const hotel = await Hotel.findById(user.hotelId).select('domain');
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, domain: hotel.domain });
    } catch (error) {
        console.error('Domain fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Update domain settings (Request change)
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { subdomain, customDomain } = body;

        // Basic validation
        if (subdomain && !/^[a-z0-9-]+$/.test(subdomain)) {
            return NextResponse.json({ error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' }, { status: 400 });
        }

        await dbConnect();

        // Check if subdomain is taken by another hotel
        if (subdomain) {
            const existing = await Hotel.findOne({
                'domain.subdomain': subdomain,
                _id: { $ne: user.hotelId }
            });
            if (existing) {
                return NextResponse.json({ error: 'Subdomain is already taken.' }, { status: 400 });
            }
        }

        const updateData: any = {};

        if (subdomain) updateData['domain.subdomain'] = subdomain;

        // If changing custom domain, reset verification
        if (customDomain !== undefined) {
            updateData['domain.customDomain'] = customDomain;
            updateData['domain.customDomainVerified'] = false;
            updateData['domain.sslEnabled'] = false;
        }

        const hotel = await Hotel.findByIdAndUpdate(
            user.hotelId,
            { $set: updateData },
            { new: true }
        ).select('domain');

        return NextResponse.json({ success: true, domain: hotel.domain });
    } catch (error) {
        console.error('Domain update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
