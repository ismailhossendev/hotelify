
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { HotelSiteConfig } from '@/lib/db/models/HotelSiteConfig';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: Request) {
    const user = await getCurrentUser();
    if (!user || !user.hotelId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        let config = await HotelSiteConfig.findOne({ hotelId: user.hotelId });

        // If no config exists, return default empty one (frontend handles default values)
        // or create one? Let's just return null and handle in frontend or return defaults.
        // Better: Return a default structure if null to avoid frontend crashes

        if (!config) {
            config = await HotelSiteConfig.create({ hotelId: user.hotelId });
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('CMS Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || !user.hotelId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await req.json();

        // Upsert logic
        const config = await HotelSiteConfig.findOneAndUpdate(
            { hotelId: user.hotelId },
            {
                $set: {
                    hero: body.hero,
                    about: body.about,
                    contact: body.contact,
                    colors: body.colors,
                    socialLinks: body.socialLinks,
                    // Gallery is updated via a separate logic if it's file upload, but for URLs list it's fine here
                    gallery: body.gallery
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('CMS Update Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
