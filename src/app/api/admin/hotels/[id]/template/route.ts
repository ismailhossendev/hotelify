
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { Template } from '@/lib/db/models/Template';
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();

    // Verify authentication and role
    const user = await getCurrentUser();
    if (!user || user.role !== 'super_admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { templateId } = await req.json();

        if (!templateId) {
            return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
        }

        // Validate template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
        }

        // Update hotel with new template
        const hotel = await Hotel.findByIdAndUpdate(
            params.id,
            { templateId: template._id },
            { new: true }
        ).populate('templateId');

        if (!hotel) {
            return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, hotel });
    } catch (error) {
        console.error('Error updating hotel template:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
