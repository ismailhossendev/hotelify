
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Room } from "@/lib/db/models/Room";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const body = await req.json();

        // This endpoint can handle partial updates to pricing structures
        const room = await Room.findById(params.id);
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

        if (body.basePrice) room.basePrice = body.basePrice;
        if (body.weekendPricing) room.weekendPricing = { ...room.weekendPricing, ...body.weekendPricing };
        if (body.specialRates) room.specialRates = body.specialRates; // Full replace for simplicity
        if (body.seasonalPricing) room.seasonalPricing = body.seasonalPricing;

        await room.save();
        return NextResponse.json({ success: true, room });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
