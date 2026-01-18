import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Offer } from '@/lib/db/models/Offer';

export const dynamic = 'force-dynamic';

// POST - Validate coupon code at checkout
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, hotelId, bookingAmount } = body;

        if (!code || !hotelId || bookingAmount === undefined) {
            return NextResponse.json({
                valid: false,
                error: 'Missing required fields: code, hotelId, bookingAmount'
            }, { status: 400 });
        }

        await dbConnect();

        const now = new Date();

        // Find matching offer - check both platform and hotel-specific offers
        const offer = await Offer.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                // Hotel-specific offer
                { scope: 'hotel', hotelId: hotelId },
                // Platform offer with no hotel restrictions
                { scope: 'platform', applicableHotels: { $size: 0 } },
                // Platform offer applicable to this hotel
                { scope: 'platform', applicableHotels: hotelId }
            ]
        });

        if (!offer) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid or expired coupon code'
            });
        }

        // Check usage limit
        if (offer.usageLimit > 0 && offer.usageCount >= offer.usageLimit) {
            return NextResponse.json({
                valid: false,
                error: 'This coupon has reached its usage limit'
            });
        }

        // Check minimum booking amount
        if (bookingAmount < offer.minBookingAmount) {
            return NextResponse.json({
                valid: false,
                error: `Minimum booking amount is ৳${offer.minBookingAmount.toLocaleString()}`
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (offer.discountType === 'percentage') {
            discountAmount = (bookingAmount * offer.discountValue) / 100;
            // Apply max cap if set
            if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
                discountAmount = offer.maxDiscountAmount;
            }
        } else {
            discountAmount = offer.discountValue;
        }

        // Discount cannot exceed booking amount
        discountAmount = Math.min(discountAmount, bookingAmount);

        return NextResponse.json({
            valid: true,
            offer: {
                id: offer._id,
                code: offer.code,
                title: offer.title,
                discountType: offer.discountType,
                discountValue: offer.discountValue
            },
            discountAmount: Math.round(discountAmount),
            newTotal: Math.round(bookingAmount - discountAmount),
            message: `${offer.discountType === 'percentage' ? offer.discountValue + '%' : '৳' + offer.discountValue} discount applied!`
        });
    } catch (error) {
        console.error('Validate offer error:', error);
        return NextResponse.json({
            valid: false,
            error: 'Failed to validate coupon'
        }, { status: 500 });
    }
}
