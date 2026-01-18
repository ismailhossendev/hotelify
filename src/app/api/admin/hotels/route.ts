import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { Plan } from '@/lib/db/models/Plan'; // Force model registration
import { User } from '@/lib/db/models/User'; // Force model registration
import { getCurrentUser } from '@/lib/auth/token';

import { Template } from '@/lib/db/models/Template'; // Force model registration 

// Ensure models are registered (workaround for Next.js HMR issues)
const _Plan = Plan;
const _User = User;
const _Template = Template;

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const hotels = await Hotel.find({})
            .populate('planId', 'name')
            .populate('templateId', 'name')
            .populate('ownerId', 'email profile.name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, hotels });

    } catch (error) {
        console.error('Admin hotels error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
