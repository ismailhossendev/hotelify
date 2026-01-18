
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, otp, password } = await req.json();

        if (!email || !otp || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        await connectDB();

        // Verify Token
        const otpHash = crypto.createHash("sha256").update(otp.trim()).digest("hex");

        const user = await User.findOne({
            email: email.toLowerCase(),
        }).select("+passwordHash +resetPasswordToken +resetPasswordExpire");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.resetPasswordToken !== otpHash) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (!user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
            return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Update User
        user.passwordHash = passwordHash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return NextResponse.json({ message: "Password reset successful" });

    } catch (error: any) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
