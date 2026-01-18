
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { SystemConfig } from "@/lib/db/models/SystemConfig";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { types } = body; // Array of strings

        if (!Array.isArray(types)) {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }

        await SystemConfig.findOneAndUpdate(
            { key: 'room_classifications' },
            { key: 'room_classifications', value: types },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, types });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
