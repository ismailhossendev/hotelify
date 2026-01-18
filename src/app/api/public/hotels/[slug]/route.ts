
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { HotelSiteConfig } from '@/lib/db/models/HotelSiteConfig';
import { Template } from '@/lib/db/models/Template';

// Force dynamic behavior to avoid caching issues with different subdomains
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        await dbConnect();

        const slug = params.slug;

        // Fetch Hotel
        const hotel = await Hotel.findOne({
            $or: [
                { slug: slug },
                { 'domain.subdomain': slug },
                { 'domain.customDomain': slug }
            ]
        }).populate('templateId');

        if (!hotel) {
            return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
        }

        if (!hotel.isActive) {
            return NextResponse.json({ success: false, error: 'Hotel is suspended' }, { status: 403 });
        }

        // Fetch Site Config
        const siteConfig = await HotelSiteConfig.findOne({ hotelId: hotel._id });

        // Merge Data for Frontend
        // We return a "PublicHotel" object that acts as the single source of truth for the template
        const publicData = {
            id: hotel._id,
            name: hotel.name,
            slug: hotel.slug,
            contact: hotel.contact,
            logo: hotel.logo,
            coverImage: hotel.coverImage,
            amenities: hotel.amenities,
            domain: hotel.domain,

            // CMS Config (Overrides or Defaults)
            config: siteConfig || {
                hero: { title: hotel.name, subtitle: 'Welcome', backgroundImage: hotel.coverImage || '' },
                about: { title: 'About Us', content: hotel.description || '' },
                contact: { ...hotel.contact, googleMapUrl: '' },
                colors: { primary: '#000000', secondary: '#ffffff' },
                socialLinks: {},
                gallery: hotel.gallery?.map((g: any) => g.url) || []
            },

            // Template Info (Critical for rendering the correct layout)
            template: hotel.templateId ? {
                id: hotel.templateId._id,
                name: hotel.templateId.name,
                category: hotel.templateId.category
            } : null
        };

        return NextResponse.json({ success: true, hotel: publicData });

    } catch (error) {
        console.error('Public Hotel Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
