import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { SiteConfig } from '@/lib/db/models/SiteConfig';
import { getCurrentUser } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const config = await SiteConfig.findOne().sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();

        // Find existing or create new
        let config = await SiteConfig.findOne().sort({ updatedAt: -1 });

        if (config) {
            config.hero = { ...config.hero, ...body.hero };
            config.featured = { ...config.featured, ...body.featured };
            config.features = body.features || config.features;
            config.updatedBy = new mongoose.Types.ObjectId(user.userId);
            await config.save();
        } else {
            config = await SiteConfig.create({
                ...body,
                updatedBy: new mongoose.Types.ObjectId(user.userId)
            });
        }

        // Audit Log
        await AuditLog.create({
            userId: user.userId,
            action: 'settings_change',
            entityType: 'SiteConfig',
            entityId: config._id,
            description: 'Updated homepage configuration'
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Site Config Update Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
