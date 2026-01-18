import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { Plan } from '@/lib/db/models/Plan';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const count = await Hotel.countDocuments({ planId: params.id });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json().catch(() => ({})); // Safe parse
        const { replacementPlanId } = body;

        // 1. Check usage if replacement not provided
        const affectedHotels = await Hotel.countDocuments({ planId: params.id });
        if (affectedHotels > 0 && !replacementPlanId) {
            return NextResponse.json({ error: 'Replacement plan required for migration' }, { status: 400 });
        }

        // 2. Migrate Users
        if (affectedHotels > 0 && replacementPlanId) {
            await Hotel.updateMany(
                { planId: params.id },
                { $set: { planId: replacementPlanId } }
            );
        }

        // 3. Delete Plan
        await Plan.findByIdAndDelete(params.id);

        return NextResponse.json({ success: true, migratedCount: affectedHotels });
    } catch (error) {
        console.error('Delete Plan Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
