import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { planId } = await req.json();

        const hotel = await Hotel.findByIdAndUpdate(params.id, { planId }, { new: true });

        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, hotel });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
