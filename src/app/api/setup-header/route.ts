
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';

export async function GET() {
    try {
        await connectDB();

        const config = await SiteConfig.findOne();

        if (!config) {
            return NextResponse.json({ success: false, error: "No config found" }, { status: 404 });
        }

        // Default Header Data
        const defaultHeader = {
            contact: {
                phone: "+880 1700-000000",
                email: "info@hotelify.com"
            },
            navigation: [
                { label: "Home", href: "/" },
                { label: "Browse Hotels", href: "/hotels" },
                { label: "Destinations", href: "/destinations" },
                { label: "Offers & Deals", href: "/offers" },
                { label: "About Us", href: "/about" }
            ],
            topBarLinks: [
                { label: "List Your Property", href: "/become-partner" },
                { label: "Help & Support", href: "/help" }
            ]
        };

        // Update if missing or empty
        if (!config.header || !config.header.navigation || config.header.navigation.length === 0) {
            const updated = await SiteConfig.findByIdAndUpdate(
                config._id,
                { $set: { header: defaultHeader } },
                { new: true }
            );
            return NextResponse.json({ success: true, message: "Header config populated", content: updated });
        }

        return NextResponse.json({ success: true, message: "Header config already exists", content: config });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
