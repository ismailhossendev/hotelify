import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { Room } from '@/lib/db/models/Room';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const city = searchParams.get('city');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guestsParam = searchParams.get('guests');
        const guests = guestsParam ? parseInt(guestsParam) : null;

        // Advanced filters
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null;
        const starRating = searchParams.get('starRating')?.split(',').map(Number) || null;
        const amenities = searchParams.get('amenities')?.split(',') || null;
        const propertyType = searchParams.get('propertyType');
        const sortBy = searchParams.get('sortBy') || 'price_asc';

        await dbConnect();

        // 1. Build hotel filter
        const hotelFilter: any = {};

        if (city) {
            hotelFilter['contact.address.city'] = { $regex: city, $options: 'i' };
        }

        if (query && !city) {
            hotelFilter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { 'contact.address.city': { $regex: query, $options: 'i' } },
                { 'contact.address.district': { $regex: query, $options: 'i' } }
            ];
        }

        // Star rating filter
        if (starRating && starRating.length > 0) {
            hotelFilter.starRating = { $in: starRating };
        }

        // Amenities filter (hotel must have ALL selected amenities)
        if (amenities && amenities.length > 0) {
            hotelFilter.amenities = { $all: amenities };
        }

        // Property type filter (we'll need to add this field to hotels later, for now skip)
        // if (propertyType) {
        //     hotelFilter.propertyType = propertyType;
        // }

        const hotels = await Hotel.find(hotelFilter)
            .select('name slug contact domain.subdomain gallery starRating amenities policies description coverImage')
            .limit(50); // Increase limit for filtering

        const now = new Date();
        const activeOffers = await import('@/lib/db/models/Offer').then(mod => mod.Offer.find({
            isActive: true,
            // Removed isPublic check to ensure badge shows for any active capable offer
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }));

        // 3. Filter by guest capacity, price range, and attach pricing
        const results = await Promise.all(hotels.map(async (hotel) => {
            let roomQuery: any = { hotelId: hotel._id };

            if (guests) {
                roomQuery['capacity.adults'] = { $gte: guests };
            }

            // Build price filter for rooms
            if (minPrice || maxPrice) {
                roomQuery.basePrice = {};
                if (minPrice) roomQuery.basePrice.$gte = minPrice;
                if (maxPrice) roomQuery.basePrice.$lte = maxPrice;
            }

            const cheapestRoom = await Room.findOne(roomQuery)
                .sort({ basePrice: 1 })
                .select('basePrice capacity');

            // Skip hotels with no suitable rooms
            if (!cheapestRoom) {
                return null;
            }

            // Find best offer for this hotel
            const hotelOffers = activeOffers.filter((offer: any) =>
                (offer.scope === 'hotel' && offer.hotelId?.toString() === hotel._id.toString()) ||
                (offer.scope === 'platform' && (
                    offer.applicableHotels.length === 0 || // All hotels
                    offer.applicableHotels.some((h: any) => h.toString() === hotel._id.toString())
                ))
            );

            // Sort by discount value (simple logic: higher is better, ignoring type diffs for now or prioritizing %)
            // Ideally we'd calculate effective discount on startPrice, but for badge we just want "20% OFF" etc.
            const bestOffer = hotelOffers.sort((a: any, b: any) => b.discountValue - a.discountValue)[0];

            return {
                ...hotel.toObject(),
                startPrice: cheapestRoom.basePrice,
                maxCapacity: cheapestRoom.capacity,
                bestOffer: bestOffer ? {
                    type: bestOffer.discountType,
                    value: bestOffer.discountValue,
                    code: bestOffer.code
                } : null
            };
        }));

        // Filter out null results
        let filteredResults = results.filter(r => r !== null);

        // 3. Sorting
        if (sortBy === 'price_asc') {
            filteredResults.sort((a, b) => (a.startPrice || 0) - (b.startPrice || 0));
        } else if (sortBy === 'price_desc') {
            filteredResults.sort((a, b) => (b.startPrice || 0) - (a.startPrice || 0));
        } else if (sortBy === 'rating_desc') {
            filteredResults.sort((a, b) => (b.starRating || 0) - (a.starRating || 0));
        }

        return NextResponse.json({
            success: true,
            hotels: filteredResults,
            count: filteredResults.length,
            filters: { city, checkIn, checkOut, guests, minPrice, maxPrice, starRating, amenities, sortBy }
        });

    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
