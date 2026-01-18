import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { User } from '@/lib/db/models/User';
import { Plan } from '@/lib/db/models/Plan';
import { getCurrentUser } from '@/lib/auth/token';
import { createHotelSchema } from '@/lib/validations/hotel';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Only super_admin or users without a hotel can create one (assuming typical flow)
        // Or maybe anyone can create if they sign up? For now, let's restrict or allow logged in users.
        // If user already has a hotelId and is not super_admin, block? 
        // Let's assume one user -> one hotel for vendor role for now.

        if (user.role !== 'super_admin' && user.hotelId) {
            return NextResponse.json({ error: 'User already owns a hotel' }, { status: 400 });
        }

        const body = await req.json();
        const validation = createHotelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, slug, planId, contact } = validation.data;

        // Check slug uniqueness
        const existingSlug = await Hotel.findOne({ slug });
        if (existingSlug) {
            return NextResponse.json({ error: 'Hotel URL/Slug already taken' }, { status: 409 });
        }

        // Verify Plan
        const plan = await Plan.findById(planId);
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        // Create Hotel
        const hotel = await Hotel.create({
            ownerId: user.userId,
            planId,
            name,
            slug,
            contact,
            domain: {
                subdomain: slug // default subdomain
            },
            subscription: {
                status: 'trial',
                expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
            },
            wallet: {
                smsCredits: plan.features.smsCreditsIncluded || 0
            }
        });

        // Update User role and hotelId
        await User.findByIdAndUpdate(user.userId, {
            role: 'vendor_admin',
            hotelId: hotel._id
        });

        // Issue new token with updated hotelId
        const { signToken, setAuthCookie } = await import('@/lib/auth/token');
        const newToken = signToken({
            userId: user.userId,
            role: 'vendor_admin',
            hotelId: hotel._id.toString()
        });
        setAuthCookie(newToken);

        // Audit Log
        await AuditLog.create({
            hotelId: hotel._id,
            userId: user.userId,
            action: 'create',
            entityType: 'Hotel',
            entityId: hotel._id,
            description: `Hotel created: ${name}`,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true, hotel }, { status: 201 });

    } catch (error) {
        console.error('Create hotel error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Super admin sees all, others see only theirs logic can be refined here
        // But typically GET /hotels might be public for marketplace? 
        // Let's assume this endpoint is for ADMIN listing or Vendor getting own.

        // If query param 'public=true' is passed, maybe return list for marketplace?
        // For now, let's implement secure access.

        let query: any = {};
        if (user.role !== 'super_admin') {
            if (!user.hotelId) {
                return NextResponse.json({ hotels: [] }); // No hotel assigned
            }
            query._id = user.hotelId;
        }

        const hotels = await Hotel.find(query)
            .populate('planId', 'name')
            .select('-wallet.smsCredits -wallet.availableBalance'); // Hide sensitive unless specifically requested

        return NextResponse.json({ success: true, hotels });

    } catch (error) {
        console.error('Get hotels error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
