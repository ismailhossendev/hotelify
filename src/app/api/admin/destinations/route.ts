
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Destination } from '@/lib/db/models/Destination';
import { getCurrentUser } from '@/lib/auth/token';

// GET: List all destinations
export async function GET() {
    try {
        await connectDB();
        const destinations = await Destination.find().sort({ order: 1, name: 1 });
        return NextResponse.json({ destinations });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }
}

// POST: Create a new destination (Super Admin only)
export async function POST(req: Request) {
    try {
        await connectDB();
        // Auth check
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Validation
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Auto-generate slug if not provided
        const slug = body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // Check duplicate
        const existing = await Destination.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const destination = await Destination.create({
            name: body.name,
            slug,
            description: body.description,
            image: body.image,
            isActive: body.isActive !== false, // Default true
            isFeatured: body.isFeatured || false,
            order: body.order || 0
        });

        return NextResponse.json({ destination, message: 'Destination created' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create destination' }, { status: 500 });
    }
}
