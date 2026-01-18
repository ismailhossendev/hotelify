import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Get distinct cities from hotels
        const cities = await Hotel.distinct('contact.address.city');

        // Filter out null/undefined and sort alphabetically
        const validCities = cities
            .filter(city => city && city.trim())
            .sort((a, b) => a.localeCompare(b));

        return NextResponse.json({
            success: true,
            cities: validCities
        });
    } catch (error) {
        console.error('Locations Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
