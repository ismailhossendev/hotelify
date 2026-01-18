import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Plan } from '@/lib/db/models/Plan';
import { getCurrentUser } from '@/lib/auth/token';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const plans = await Plan.find({}).sort({ 'pricing.monthly': 1 });
        return NextResponse.json({ success: true, plans });
    } catch (error) {
        console.error('Plans API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Transform body to match schema structure
        const planData = {
            name: body.name,
            slug: body.name.toLowerCase().replace(/\s+/g, '-'),
            pricing: {
                monthly: body.monthlyPrice,
                yearly: body.yearlyPrice || body.monthlyPrice * 12,
                currency: 'BDT',
                smsCostPerUnit: body.smsCostPerUnit
            },
            features: {
                maxRooms: body.maxRooms,
                maxStaff: body.maxStaff,
                smsCreditsIncluded: body.smsCredits,
                posEnabled: body.posEnabled,
                housekeepingEnabled: body.housekeepingEnabled,
                customDomainEnabled: body.customDomainEnabled,
                reportsEnabled: true
            },
            commissionRate: body.commissionRate,
            isCommissionBased: body.isCommissionBased,
            isVisible: body.isVisible,
            isActive: true
        };

        const plan = await Plan.create(planData);
        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error('Create Plan Error:', error);
        return NextResponse.json({ error: error.message || 'Error creating plan' }, { status: 500 });
    }
}
