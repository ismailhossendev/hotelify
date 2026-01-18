
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Room } from "@/lib/db/models/Room";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    const room = await Room.findById(params.id);
    return NextResponse.json({ success: true, room });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const body = await req.json();
        const room = await Room.findByIdAndUpdate(params.id, body, { new: true });
        return NextResponse.json({ success: true, room });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        // Ideally check for existing bookings first!
        await Room.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
