import { NextRequest } from 'next/server';
import { Hotel } from '@/lib/db/models/Hotel';

export interface TenantContext {
    hotelId: string;
    hotelSlug: string;
    planId: string;
    features: {
        posEnabled: boolean;
        customDomainEnabled: boolean;
        housekeepingEnabled: boolean;
    };
}

export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
    const subdomain = request.headers.get('x-tenant-subdomain');
    const customDomain = request.headers.get('x-tenant-domain');

    let hotel: any;

    if (subdomain) {
        hotel = await Hotel.findOne({ 'domain.subdomain': subdomain, isActive: true })
            .populate('planId')
            .lean();
    } else if (customDomain) {
        hotel = await Hotel.findOne({
            'domain.customDomain': customDomain,
            'domain.customDomainVerified': true,
            isActive: true
        }).populate('planId').lean();
    }

    if (!hotel) return null;

    return {
        hotelId: hotel._id.toString(),
        hotelSlug: hotel.slug,
        planId: hotel.planId._id.toString(),
        features: hotel.planId.features
    };
}

export function withTenantIsolation<T extends { hotelId: string }>(
    query: T,
    tenantContext: TenantContext
): T {
    return {
        ...query,
        hotelId: tenantContext.hotelId
    };
}
