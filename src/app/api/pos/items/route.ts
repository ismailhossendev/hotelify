import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ShopItem } from '@/lib/db/models/ShopItem';
import { getCurrentUser } from '@/lib/auth/token';
import { z } from 'zod';

const itemSchema = z.object({
    name: z.string().min(1),
    category: z.enum(['food', 'beverage', 'snack', 'gift', 'service', 'other']),
    price: z.number().positive(),
    cost: z.number().optional(),
    trackInventory: z.boolean().default(false),
    quantity: z.number().default(0)
});

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Only vendor staff can manage POS items
        if (!user || !user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Validate
        const validation = itemSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
        }

        const item = await ShopItem.create({
            ...validation.data,
            hotelId: user.hotelId
        });

        return NextResponse.json({ success: true, item }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.hotelId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // List all active items for the hotel
        const items = await ShopItem.find({
            hotelId: user.hotelId,
            isActive: true
        }).sort({ category: 1, name: 1 });

        return NextResponse.json({ success: true, items });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
