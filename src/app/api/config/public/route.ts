import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';

// Public endpoint to get site configuration (categories, etc.)
export async function GET() {
    try {
        await dbConnect();
        const config = await SiteConfig.findOne().sort({ updatedAt: -1 }).lean();

        if (!config) {
            return NextResponse.json({ success: true, config: { categories: { items: [] } } });
        }

        // Return only public-safe fields
        return NextResponse.json({
            success: true,
            config: {
                categories: config.categories || { items: [] },
                destinations: config.destinations || { items: [] },
            }
        });
    } catch (error) {
        console.error('Public Config Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
