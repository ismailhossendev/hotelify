import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Template } from '@/lib/db/models/Template';
import { getCurrentUser } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const templates = await Template.find().sort({ sortOrder: 1, createdAt: -1 });
        return NextResponse.json({ success: true, templates });
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

        const body = await req.json();
        await dbConnect();

        const template = await Template.create(body);
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Template create error:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
