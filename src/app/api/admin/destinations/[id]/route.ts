
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Destination } from '@/lib/db/models/Destination';
import { getCurrentUser } from '@/lib/auth/token';

// PUT: Update Destination
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('[DEBUG] Destination Update - Received body:', JSON.stringify(body, null, 2));
        console.log('[DEBUG] isFeatured value:', body.isFeatured, 'type:', typeof body.isFeatured);

        const updateData = {
            name: body.name,
            slug: body.slug,
            description: body.description,
            image: body.image,
            isActive: body.isActive === true,
            isFeatured: body.isFeatured === true,
            order: body.order || 0
        };
        console.log('[DEBUG] Update data being sent to MongoDB:', JSON.stringify(updateData, null, 2));

        const updated = await Destination.findByIdAndUpdate(
            params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        console.log('[DEBUG] Updated document:', JSON.stringify(updated, null, 2));

        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ destination: updated, message: 'Updated successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// DELETE: Delete Destination
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if used by any hotels? (Ideally yes, but skip for MVP speed)
        await Destination.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
