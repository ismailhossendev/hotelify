import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';
import { Hotel } from '@/lib/db/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Find the most recently updated config, or the first one
        const config = await SiteConfig.findOne().sort({ updatedAt: -1 }).lean() as any;

        if (!config) {
            // Return default structure if no config exists
            return NextResponse.json({
                success: true,
                config: {
                    hero: {
                        title: "Find your perfect stay",
                        subtitle: "Search hundreds of hotels, resorts, and vacation rentals for your next trip.",
                        backgroundImage: ""
                    },
                    featured: {
                        title: "Trending Destinations",
                        subtitle: "Most popular choices for travelers",
                        hotels: []
                    },
                    features: []
                }
            });
        }

        // Fetch featured hotels if hotelIds exist
        let featuredHotels: any[] = [];
        if (config.featured?.hotelIds && config.featured.hotelIds.length > 0) {
            featuredHotels = await Hotel.find({
                _id: { $in: config.featured.hotelIds },
                isActive: true
            }).lean();
        }

        // Build the response config with populated hotels
        const responseConfig = {
            ...config,
            featured: {
                ...config.featured,
                hotels: featuredHotels
            }
        };

        return NextResponse.json({ success: true, config: responseConfig });
    } catch (error) {
        console.error('Site Config Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
