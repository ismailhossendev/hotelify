import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Destination } from '@/lib/db/models/Destination';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        // Only return active destinations for public list
        // Aggregate to get hotel count and starting price
        const destinations = await Destination.aggregate([
            { $match: { isActive: true } },
            { $sort: { order: 1, name: 1 } },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: 'destinationId',
                    as: 'hotels'
                }
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    image: 1,
                    description: 1,
                    isFeatured: 1,
                    hotelCount: {
                        $size: {
                            $filter: {
                                input: '$hotels',
                                as: 'hotel',
                                cond: { $eq: ['$$hotel.isActive', true] }
                            }
                        }
                    },
                    startingPrice: {
                        $min: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$hotels',
                                        as: 'hotel',
                                        cond: { $eq: ['$$hotel.isActive', true] }
                                    }
                                },
                                as: 'h',
                                in: '$$h.startPrice'
                            }
                        }
                    }
                }
            }
        ]);

        return NextResponse.json({ destinations });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }
}
