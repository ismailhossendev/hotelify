import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const features = [
            { icon: 'ShieldCheck', title: "Secure Booking", description: "Your payments are protected with bank-level security." },
            { icon: 'Clock', title: "24/7 Support", description: "Our team is here to help you anytime, day or night." },
            { icon: 'Heart', title: "Best Price Guarantee", description: "Find a lower price? We'll match it." }
        ];

        // Update the most recent config
        const config = await SiteConfig.findOneAndUpdate(
            {},
            { $set: { features: features } },
            { sort: { updatedAt: -1 }, new: true }
        );

        return NextResponse.json({ success: true, message: 'Features updated', config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
