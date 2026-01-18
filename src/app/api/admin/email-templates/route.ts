import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { NotificationTemplate } from '@/lib/db/models/NotificationTemplate';
import { verifyToken } from '@/lib/auth/token';

// GET: Fetch all templates or specific type
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Verify Admin Access
        const token = req.cookies.get('token')?.value;
        const auth = verifyToken(token || '');
        if (!auth || auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        if (type) {
            const template = await NotificationTemplate.findOne({ type });
            return NextResponse.json({ success: true, template });
        }

        const templates = await NotificationTemplate.find({});
        return NextResponse.json({ success: true, templates });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Upsert Template
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        const auth = verifyToken(token || '');
        if (!auth || auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, subject, htmlContent, variables } = body;

        if (!type || !subject || !htmlContent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const template = await NotificationTemplate.findOneAndUpdate(
            { type },
            {
                type,
                subject,
                htmlContent,
                variables: variables || [],
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, template });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
