
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        await connectDB();

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        console.log(`[VerifyOTP] Verifying for email: ${email}`);
        console.log(`[VerifyOTP] Input OTP: ${otp}`);
        console.log(`[VerifyOTP] Computed Hash: ${otpHash}`);

        // Debug: Find user first without token check to see what's in DB
        const userDebug = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpire");
        if (userDebug) {
            console.log(`[VerifyOTP] Found User. Token in DB: ${userDebug.resetPasswordToken}`);
            console.log(`[VerifyOTP] Expires: ${userDebug.resetPasswordExpire}, Now: ${new Date()}`);
            console.log(`[VerifyOTP] Match? ${userDebug.resetPasswordToken === otpHash}`);
            console.log(`[VerifyOTP] Not Expired? ${userDebug.resetPasswordExpire > new Date()}`);
        } else {
            console.log(`[VerifyOTP] User not found by email`);
        }

        const user = await User.findOne({
            email,
            resetPasswordToken: otpHash,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        return NextResponse.json({ message: "OTP Verified" });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
