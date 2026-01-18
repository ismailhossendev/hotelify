import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { SystemConfig } from '@/lib/db/models/SystemConfig';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch global config
        const configDoc = await SystemConfig.findOne({ key: 'platform_config' });

        // Return default object if not found
        const config = configDoc ? configDoc.value : {};

        return NextResponse.json({ success: true, config });
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

        // Upsert the configuration under a single key
        await SystemConfig.findOneAndUpdate(
            { key: 'platform_config' },
            {
                key: 'platform_config',
                value: body
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, message: 'Settings saved' });
    } catch (error) {
        console.error('Settings save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
