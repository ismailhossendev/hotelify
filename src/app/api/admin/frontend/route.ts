import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const config = await SiteConfig.findOne().sort({ updatedAt: -1 });
        // Return 'content' key to match what the frontend expects, or refactor frontend. 
        // Let's match frontend expectation for now but map the data object.
        return NextResponse.json({ success: true, content: config || {} });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Update existing or create new
        const config = await SiteConfig.findOneAndUpdate(
            {}, // find any
            { ...body, updatedBy: user.userId },
            { upsert: true, new: true, sort: { updatedAt: -1 } }
        );

        return NextResponse.json({ success: true, message: 'Content updated', content: config });
    } catch (error) {
        console.error("Save Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
