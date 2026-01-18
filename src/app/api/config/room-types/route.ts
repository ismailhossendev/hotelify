
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { SystemConfig } from "@/lib/db/models/SystemConfig";

export async function GET() {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: 'room_classifications' });

    // Default fallback if not set in DB
    const types = config?.value || ['Single', 'Double', 'Twin', 'Family', 'Suite'];

    return NextResponse.json({
        success: true,
        types
    });
}
