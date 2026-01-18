
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { getCurrentUser } from '@/lib/auth/token';

// PATCH: Verify Hotel Documents & Approve
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action } = body;

        let updateData = {};

        if (action === 'verify_documents') {
            updateData = {
                'documents.$[].verified': true,
                status: 'active',
                isVerified: true,
                isActive: true
            };
        } else if (action === 'reject') {
            updateData = { status: 'rejected', isActive: false };
        }

        const hotel = await Hotel.findByIdAndUpdate(params.id, updateData, { new: true });

        return NextResponse.json({ hotel, message: 'Updated successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
    }
}
