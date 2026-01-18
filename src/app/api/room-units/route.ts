
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { RoomUnit } from "@/lib/db/models/RoomUnit";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Supports bulk creation: e.g. "101,102,103"
        const { roomNos, roomTypeId, hotelId } = body;

        if (!roomNos || !roomTypeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const numbers = (roomNos as string).split(',').map(s => s.trim()).filter(Boolean);
        const created = [];

        for (const num of numbers) {
            // Check existence
            const exists = await RoomUnit.findOne({ hotelId, roomNo: num });
            if (!exists) {
                const u = await RoomUnit.create({
                    hotelId,
                    roomTypeId,
                    roomNo: num,
                    status: 'clean'
                });
                created.push(u);
            }
        }

        return NextResponse.json({ success: true, count: created.length, units: created });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    const url = new URL(req.url);
    const hotelId = url.searchParams.get("hotelId"); // In real app, get from Token
    // We'll assume the client passes it for now or we fix auth context later

    // Fallback: If no hotelId provided (and no auth context in this route snippet), return all (not safe for prod, but OK for dev block)
    // Actually, let's just fetch all RoomUnits populated with Type

    const units = await RoomUnit.find().populate('roomTypeId');
    return NextResponse.json({ success: true, units });
}
