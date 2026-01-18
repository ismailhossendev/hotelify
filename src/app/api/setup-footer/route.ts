
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

        // Default Footer Data
        const defaultFooter = {
            description: "Discover and book the best hotels across Bangladesh. Your comfort is our priority.",
            socialLinks: {
                facebook: "https://facebook.com",
                twitter: "https://twitter.com",
                instagram: "https://instagram.com",
                linkedin: "https://linkedin.com"
            },
            quickLinks: [
                { label: "Browse Hotels", href: "/hotels" },
                { label: "Popular Destinations", href: "/destinations" },
                { label: "Offers & Deals", href: "/offers" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" }
            ],
            supportLinks: [
                { label: "Help Center", href: "/help" },
                { label: "FAQs", href: "/faq" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" }
            ],
            copyrightText: "© 2024 Hotelify. All rights reserved."
        };

        // Update if missing or partial
        // We'll use $set to ensure it's fully populated or overwritten if it was just basic defaults
        const updated = await SiteConfig.findByIdAndUpdate(
            config._id,
            { $set: { footer: defaultFooter } },
            { new: true }
        );

        return NextResponse.json({ success: true, message: "Footer config populated", content: updated });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
